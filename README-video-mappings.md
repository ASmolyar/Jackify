# Video Mappings Generator

This script generates a static mapping file of Spotify tracks to YouTube video IDs, eliminating the need for real-time API calls during playback.

## Usage

1. **Generate mappings:**
   ```bash
   node generate-video-mappings.js
   ```

2. **The script will:**
   - Read all CSV files from `/Users/aaronsmolyar/Documents/spotify_playlists/csvs/`
   - Extract unique songs (track name + artist)
   - Search YouTube for each song
   - Save results to `video-mappings.json`
   - Resume from existing mappings if the file exists

3. **Commit and push:**
   ```bash
   git add video-mappings.json
   git commit -m "Update video mappings"
   git push
   ```

## How It Works

### Lookup Priority
1. **Pre-generated mappings** (`video-mappings.json`) - checked first
2. **localStorage cache** - checked second
3. **YouTube API** - fallback for new songs not in mappings

### Key Format
Keys are formatted as: `yt_trackname_artistname` with spaces replaced by underscores and all lowercase.

Example: `yt_someone_new_hozier`

### Rate Limiting
The script includes a 100ms delay between API calls to avoid rate limiting. It saves progress every 10 songs, so you can stop and resume without losing work.

### API Quota
- Each YouTube search costs 100 quota units
- Default daily quota is 10,000 units (100 searches/day)
- The script will stop if quota is exceeded and save progress

## Maintenance

- Run periodically when you add new playlists
- Manually edit `video-mappings.json` to fix incorrect video matches
- The app will use mappings file if present, falling back to API for unmapped songs
