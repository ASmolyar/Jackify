const fs = require('fs');
const path = require('path');
const https = require('https');

// YouTube API key - you'll need to set this
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

// Path to CSV files
const CSV_DIR = '/Users/aaronsmolyar/Documents/spotify_playlists/csvs';

// Threshold for duration difference (in seconds)
const DURATION_THRESHOLD = 10; // Report if difference > 10 seconds

// Helper to parse CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));

        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx];
            });
            rows.push(row);
        }
    }

    return rows;
}

// Search YouTube for a track
async function searchYouTube(trackName, artistName) {
    const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${YOUTUBE_API_KEY}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.items && json.items.length > 0) {
                        resolve(json.items[0].id.videoId);
                    } else {
                        resolve(null);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

// Get YouTube video duration
async function getVideoDuration(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.items && json.items.length > 0) {
                        const duration = json.items[0].contentDetails.duration;
                        // Parse ISO 8601 duration (e.g., PT3M45S)
                        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                        const hours = parseInt(match[1] || 0);
                        const minutes = parseInt(match[2] || 0);
                        const seconds = parseInt(match[3] || 0);
                        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                        resolve(totalSeconds);
                    } else {
                        resolve(null);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

// Delay helper
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function validatePlaylist(csvFile) {
    const playlistName = path.basename(csvFile, '.csv').replace(/_/g, ' ');
    console.log(`\n📁 Checking: ${playlistName}`);

    const csvText = fs.readFileSync(csvFile, 'utf-8');
    const tracks = parseCSV(csvText);

    const mismatches = [];

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const trackName = track['Track Name'];
        const artistName = track['Artist Name(s)'];
        const spotifyDurationMs = parseInt(track['Duration (ms)']);
        const spotifyDurationSec = Math.round(spotifyDurationMs / 1000);

        try {
            // Search for YouTube video
            const videoId = await searchYouTube(trackName, artistName);

            if (!videoId) {
                mismatches.push({
                    track: `${trackName} - ${artistName}`,
                    issue: 'No YouTube video found',
                    spotifyDuration: formatDuration(spotifyDurationSec),
                    youtubeDuration: 'N/A',
                    difference: 'N/A'
                });
                continue;
            }

            // Get video duration
            const youtubeDurationSec = await getVideoDuration(videoId);

            if (!youtubeDurationSec) {
                mismatches.push({
                    track: `${trackName} - ${artistName}`,
                    issue: 'Could not get video duration',
                    spotifyDuration: formatDuration(spotifyDurationSec),
                    youtubeDuration: 'N/A',
                    difference: 'N/A'
                });
                continue;
            }

            const difference = Math.abs(spotifyDurationSec - youtubeDurationSec);

            if (difference > DURATION_THRESHOLD) {
                mismatches.push({
                    track: `${trackName} - ${artistName}`,
                    issue: 'Duration mismatch',
                    spotifyDuration: formatDuration(spotifyDurationSec),
                    youtubeDuration: formatDuration(youtubeDurationSec),
                    difference: `${difference}s`,
                    videoId: videoId
                });
            }

            // Rate limiting - wait between requests
            await delay(100);

        } catch (err) {
            console.error(`  ❌ Error checking "${trackName}": ${err.message}`);
        }

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            console.log(`  Checked ${i + 1}/${tracks.length} tracks...`);
        }
    }

    return { playlistName, mismatches, totalTracks: tracks.length };
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function main() {
    console.log('🎵 YouTube Duration Validation Tool\n');
    console.log(`Threshold: ${DURATION_THRESHOLD} seconds\n`);

    if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ Please set YOUTUBE_API_KEY environment variable');
        console.error('   export YOUTUBE_API_KEY=your_key_here');
        process.exit(1);
    }

    const csvFiles = fs.readdirSync(CSV_DIR)
        .filter(f => f.endsWith('.csv'))
        .map(f => path.join(CSV_DIR, f));

    console.log(`Found ${csvFiles.length} playlists\n`);

    const allResults = [];

    for (const csvFile of csvFiles) {
        const result = await validatePlaylist(csvFile);
        allResults.push(result);

        if (result.mismatches.length > 0) {
            console.log(`  ⚠️  Found ${result.mismatches.length} issues:`);
            result.mismatches.forEach(m => {
                console.log(`     - ${m.track}`);
                console.log(`       Spotify: ${m.spotifyDuration} | YouTube: ${m.youtubeDuration} | Diff: ${m.difference}`);
                if (m.videoId) {
                    console.log(`       https://youtube.com/watch?v=${m.videoId}`);
                }
            });
        } else {
            console.log(`  ✅ All tracks match!`);
        }
    }

    // Summary
    console.log('\n\n📊 SUMMARY\n');
    let totalTracks = 0;
    let totalMismatches = 0;

    allResults.forEach(r => {
        totalTracks += r.totalTracks;
        totalMismatches += r.mismatches.length;
        if (r.mismatches.length > 0) {
            console.log(`${r.playlistName}: ${r.mismatches.length}/${r.totalTracks} issues`);
        }
    });

    console.log(`\nTotal: ${totalMismatches}/${totalTracks} tracks with duration issues`);
    console.log(`Success rate: ${((totalTracks - totalMismatches) / totalTracks * 100).toFixed(1)}%`);
}

main().catch(console.error);
