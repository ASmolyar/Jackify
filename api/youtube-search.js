export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch from YouTube API' });
    }
}
