# Jackify

**[jackify.us](https://jackify.us)**

A Spotify-inspired web music player that plays Jack's playlists using YouTube integration. Browse playlists, view album artwork, and enjoy seamless playback with a familiar interface.

## In Memory of Jack Dutton

**Jack Davis Dutton** (July 12, 2005 – December 18, 2025)

This project is dedicated to Jack Dutton, my best friend since 4th grade, who passed away on December 18, 2025 in an aviation related accident.

**Jackify**— Jackify is a project to preserve the final state of his spotify account. Music was a huge part of who Jack was, and a huge part of what we shared. I'll be missing him.

Through this project, his music lives on.


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

### YouTube Player
The embedded YouTube player is how the music is played without needing a license or subscription.

### Playlist Filtering
Three-tier filtering system allows users to view all content, only custom playlists, or Spotify-generated "Made for you" content.

## About This Project

This is a personal memorial project created to honor and preserve Jack Dutton's music collection. It serves as a digital archive of his playlists and a celebration of his love for music.

Built with love and remembrance by his 4th grade buddy, Aaron Smolyar.

Love you Jackiefwend.

## Repository

[https://github.com/ASmolyar/Jackify](https://github.com/ASmolyar/Jackify)
