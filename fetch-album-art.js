const fs = require('fs');
const path = require('path');
const https = require('https');

// Create album-art directory if it doesn't exist
const albumArtDir = path.join(__dirname, 'album-art');
if (!fs.existsSync(albumArtDir)) {
    fs.mkdirSync(albumArtDir);
}

// Parse CSV file
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                fields.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
    }
    fields.push(current);
    return fields;
}

function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]);
    const trackUriIdx = headers.indexOf('Track URI');
    const trackIds = [];

    for (let i = 1; i < lines.length; i++) {
        const fields = parseCSVLine(lines[i]);
        const trackUri = fields[trackUriIdx] || '';
        const trackId = trackUri.split(':')[2];
        if (trackId) {
            trackIds.push(trackId);
        }
    }
    return trackIds;
}

// Download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', reject);
        }).on('error', reject);
    });
}

// Fetch album art from Spotify oEmbed
async function fetchAlbumArt(trackId) {
    const url = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.thumbnail_url);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Main function
async function main() {
    const csvsDir = path.join(__dirname, 'csvs');
    const csvFiles = fs.readdirSync(csvsDir).filter(f => f.endsWith('.csv'));

    const allTrackIds = new Set();

    // Collect all unique track IDs
    console.log('Reading CSV files...');
    for (const csvFile of csvFiles) {
        const csvPath = path.join(csvsDir, csvFile);
        const content = fs.readFileSync(csvPath, 'utf-8');
        const trackIds = parseCSV(content);
        trackIds.forEach(id => allTrackIds.add(id));
    }

    console.log(`Found ${allTrackIds.size} unique tracks`);

    const trackIdArray = Array.from(allTrackIds);
    let processed = 0;
    let downloaded = 0;
    let failed = 0;

    // Fetch and download album art for each track
    for (const trackId of trackIdArray) {
        const imagePath = path.join(albumArtDir, `${trackId}.jpg`);

        // Skip if already exists
        if (fs.existsSync(imagePath)) {
            processed++;
            console.log(`[${processed}/${trackIdArray.length}] Skipped ${trackId} (already exists)`);
            continue;
        }

        try {
            const artUrl = await fetchAlbumArt(trackId);
            if (artUrl) {
                await downloadImage(artUrl, imagePath);
                downloaded++;
                console.log(`[${processed + 1}/${trackIdArray.length}] Downloaded ${trackId}`);
            } else {
                failed++;
                console.log(`[${processed + 1}/${trackIdArray.length}] No artwork for ${trackId}`);
            }
        } catch (error) {
            failed++;
            console.log(`[${processed + 1}/${trackIdArray.length}] Failed ${trackId}: ${error.message}`);
        }

        processed++;

        // Wait 150ms between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}, Total: ${trackIdArray.length}`);
}

main().catch(console.error);
