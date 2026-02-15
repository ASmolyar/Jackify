# Image Setup Guide

This guide explains how to set up images for Jackify using Vercel Blob storage.

## Prerequisites

1. Node.js installed
2. Vercel account with Blob storage enabled
3. BLOB_READ_WRITE_TOKEN from Vercel

## Getting Your Blob Token

1. Go to https://vercel.com/dashboard/stores
2. Create a new Blob store (or use existing)
3. Click on your store
4. Go to "Settings" → "Tokens"
5. Create a new token with read/write access
6. Copy the token

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Your Blob Token

```bash
export BLOB_READ_WRITE_TOKEN=your_token_here
```

Or create a `.env` file:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

### 3. Download Album Artwork (if needed)

If the `album-art/` folder doesn't exist yet:

```bash
npm run fetch-album-art
```

This will:
- Scan all CSV files for track IDs
- Download album artwork from Spotify oEmbed API
- Save images to `album-art/` folder
- Takes ~6 minutes (2390 tracks with rate limiting)

### 4. Upload Images to Vercel Blob

```bash
npm run upload-to-blob
```

This uploads:
- Playlist covers from `pfps/`
- Album artwork from `album-art/`

### 5. Generate Config File

```bash
npm run generate-config
```

This creates `blob-config.json` with your blob base URL.

### 6. Test Locally

Open `index.html` in a browser. Images should load from Vercel Blob.

### 7. Deploy to Vercel

```bash
vercel deploy
```

The app will automatically use Blob URLs when `blob-config.json` is present.

## Development

For local development without Blob:
- Images will fall back to local paths (`pfps/` and `album-art/`)
- This works fine for testing

## File Structure

```
Jackify/
├── pfps/                    # Playlist cover images (gitignored)
├── album-art/               # Album artwork (gitignored)
├── blob-config.json         # Blob base URL (gitignored, auto-generated)
├── fetch-album-art.js       # Downloads album art from Spotify
├── upload-to-blob.js        # Uploads images to Vercel Blob
└── generate-blob-config.js  # Generates config from blob store
```

## Notes

- All images are in `.gitignore` to avoid copyright issues and repo bloat
- Album artwork is fetched from Spotify's public oEmbed API
- Rate limiting prevents Spotify from blocking requests
- Vercel Blob has generous free tier (1GB storage, 1GB bandwidth/month)
