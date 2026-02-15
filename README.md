# Jackify

A Spotify-inspired web music player that plays Jack's playlists using YouTube integration. Browse playlists, view album artwork, and enjoy seamless playback with a familiar interface.

## Features

- **Spotify-Style Interface** - Clean, modern UI inspired by Spotify's design
- **YouTube Playback** - Integrated YouTube player for music streaming
- **Album Artwork** - Display album covers for all tracks using Vercel Blob storage
- **Playlist Filtering** - Filter between "All", "Playlists", and "Made for you" categories
- **Date Tracking** - See when Jack added each song to playlists
- **Player Controls** - Full playback controls including shuffle, repeat, progress bar, and volume
- **Multi-Artist Support** - Properly formatted artist names for collaborative tracks

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **YouTube Integration**: YouTube IFrame API
- **Image Storage**: Vercel Blob storage
- **Hosting**: Vercel
- **Version Control**: GitHub

## Project Structure

```
Jackify/
├── index.html              # Main HTML structure
├── styles.css              # All styling and layout
├── app.js                  # Application logic and player controls
├── jack_spotify.png        # Profile picture
├── vercel.json            # Vercel deployment configuration
└── Spotify CSV/           # Playlist data files
    └── *.csv              # Individual playlist track listings
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ASmolyar/Jackify.git
   cd Jackify
   ```

2. Serve the files locally (e.g., with Python):
   ```bash
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

## Deployment

The project is configured for deployment on Vercel. To deploy:

1. Connect your GitHub repository to Vercel
2. Push changes to the `master` branch
3. Vercel will automatically build and deploy

### Vercel Auto-Deployment

To enable auto-deployment from GitHub:
1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Import the GitHub repository
3. Enable "Automatic Deployments" for the connected repository
4. All pushes to `master` will trigger automatic deployments

## Playlist Categories

- **Playlists**: Jack's custom-curated playlists
- **Made for you**: Spotify-generated playlists including:
  - On Repeat
  - Repeat Rewind
  - Top Songs (yearly collections)

## How It Works

1. **Playlist Loading**: Reads CSV files from the `Spotify CSV/` directory
2. **Album Artwork**: Fetches album covers from Vercel Blob storage with local fallbacks
3. **YouTube Integration**: Searches and plays tracks using the YouTube IFrame API
4. **Character Encoding**: Handles UTF-8 characters in playlist names (e.g., curved apostrophes)

## Key Features Implementation

### Album Artwork
Album art is stored in Vercel Blob storage and fetched using the track's Spotify URI. Local fallback images are used when blob storage is unavailable.

### YouTube Player Customization
The embedded YouTube player is scaled and cropped to hide branding elements (logo, profile picture) for a cleaner viewing experience.

### Playlist Filtering
Three-tier filtering system allows users to view all content, only custom playlists, or Spotify-generated "Made for you" content.

## Browser Compatibility

Tested and working on modern browsers including:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

This is a personal project showcasing Jack's music collection.

## Repository

[https://github.com/ASmolyar/Jackify](https://github.com/ASmolyar/Jackify)
