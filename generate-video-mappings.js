const fs = require('fs');
const path = require('path');
const https = require('https');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLISTS_DIR = '/Users/aaronsmolyar/Documents/spotify_playlists/csvs';
const OUTPUT_FILE = './video-mappings.json';
const DELAY_MS = 200; // Delay between requests to avoid rate limiting

// Load existing mappings if they exist
function loadExistingMappings() {
    if (fs.existsSync(OUTPUT_FILE)) {
        console.log('Loading existing mappings...');
        return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    }
    return {};
}

// Parse CSV files and extract unique songs
function extractSongsFromPlaylists() {
    const songs = new Map();
    const files = fs.readdirSync(PLAYLISTS_DIR).filter(f => f.endsWith('.csv'));

    console.log(`Found ${files.length} playlist files`);

    for (const file of files) {
        const filePath = path.join(PLAYLISTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').slice(1); // Skip header

        for (const line of lines) {
            if (!line.trim()) continue;

            // Parse CSV (simple split, assumes no commas in quoted fields)
            const parts = line.split(',');
            if (parts.length < 5) continue;

            // Extract track name and artist, removing quotes
            const trackName = parts[1]?.replace(/^"|"$/g, '').trim();
            const artistName = parts[3]?.replace(/^"|"$/g, '').trim();

            if (trackName && artistName) {
                const key = `${trackName.toLowerCase()}_${artistName.toLowerCase()}`.replace(/\s+/g, '_');
                songs.set(key, { trackName, artistName });
            }
        }
    }

    console.log(`Extracted ${songs.size} unique songs`);
    return songs;
}

// Search YouTube using API (fallback)
function searchYouTubeAPI(trackName, artistName) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${trackName} ${artistName}`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=1&key=${YOUTUBE_API_KEY}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) {
                        resolve(null); // API error, return null
                        return;
                    }
                    if (result.items && result.items.length > 0) {
                        resolve(result.items[0].id.videoId);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// Search YouTube by scraping search results page
async function searchYouTube(trackName, artistName) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${trackName} ${artistName}`);
        const url = `https://www.youtube.com/results?search_query=${query}`;

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', async () => {
                try {
                    // Extract video IDs from the HTML
                    const videoIdMatch = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

                    if (videoIdMatch && videoIdMatch[1]) {
                        resolve(videoIdMatch[1]);
                    } else {
                        // Fallback: try to find /watch?v= pattern
                        const watchMatch = data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
                        if (watchMatch && watchMatch[1]) {
                            resolve(watchMatch[1]);
                        } else {
                            // Scraping failed, try API fallback
                            console.log('    → Scraping failed, trying API...');
                            const apiResult = await searchYouTubeAPI(trackName, artistName);
                            resolve(apiResult);
                        }
                    }
                } catch (e) {
                    // On error, try API fallback
                    try {
                        const apiResult = await searchYouTubeAPI(trackName, artistName);
                        resolve(apiResult);
                    } catch (apiError) {
                        resolve(null);
                    }
                }
            });
        }).on('error', async () => {
            // Network error, try API fallback
            try {
                const apiResult = await searchYouTubeAPI(trackName, artistName);
                resolve(apiResult);
            } catch (apiError) {
                resolve(null);
            }
        });
    });
}

// Sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
    console.log('Starting video mapping generation...\n');

    // Load existing mappings
    const mappings = loadExistingMappings();
    const existingCount = Object.keys(mappings).length;
    console.log(`Loaded ${existingCount} existing mappings\n`);

    // Extract songs from playlists
    const songs = extractSongsFromPlaylists();

    // Filter out already mapped songs
    const songsToMap = Array.from(songs.entries()).filter(([key]) => !mappings[key]);
    console.log(`Need to map ${songsToMap.length} new songs\n`);

    if (songsToMap.length === 0) {
        console.log('All songs already mapped!');
        return;
    }

    // Process songs
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const [key, { trackName, artistName }] of songsToMap) {
        processed++;

        try {
            console.log(`[${processed}/${songsToMap.length}] Searching: ${trackName} - ${artistName}`);
            const videoId = await searchYouTube(trackName, artistName);

            if (videoId) {
                mappings[key] = videoId;
                succeeded++;
                console.log(`  ✓ Found: ${videoId}`);
            } else {
                console.log(`  ✗ No video found`);
                failed++;
            }

            // Save progress every 10 songs
            if (processed % 10 === 0) {
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mappings, null, 2));
                console.log(`  → Progress saved (${Object.keys(mappings).length} total mappings)\n`);
            }

            // Rate limiting
            await sleep(DELAY_MS);

        } catch (error) {
            console.log(`  ✗ Error: ${error.message}`);
            failed++;
            // Continue with next song
        }
    }

    // Final save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mappings, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total mappings: ${Object.keys(mappings).length}`);
    console.log(`Newly added: ${succeeded}`);
    console.log(`Failed: ${failed}`);
    console.log(`Output file: ${OUTPUT_FILE}`);
    console.log('='.repeat(50));
}

main().catch(console.error);
