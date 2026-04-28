// Generate violations/data.json — for every track whose currently-mapped
// YouTube video duration differs from Spotify by more than THRESHOLD seconds,
// fetch a handful of YouTube search candidates (with durations) so the user
// can pick a better video in the HTML viewer.
//
// Resumable: writes to data.json after each violation is processed and skips
// any violation already present in data.json on restart.

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const CSV_DIR = '/Users/aaronsmolyar/Documents/spotify_playlists/csvs';
const FIXED_MAPPINGS_FILE = path.join(ROOT, 'youtube-mappings-fixed.json');
const VIDEO_MAPPINGS_FILE = path.join(ROOT, 'video-mappings.json');
const OUT_FILE = path.join(__dirname, 'data.json');

const THRESHOLD = 10;            // seconds — anything above is a "violation"
const DELAY_SEARCH = 200;        // ms between search-page requests
const DELAY_DURATION = 200;      // ms between duration scrapes
const MAX_CANDIDATES = 6;        // candidates to keep per violation
const MAX_QUERIES = 3;           // search queries per violation (stop early if we have enough)

// ── helpers (lifted from smart-remap.js) ─────────────────────────────

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '', inQuotes = false;
        for (const ch of lines[i]) {
            if (ch === '"') inQuotes = !inQuotes;
            else if (ch === ',' && !inQuotes) { values.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
            else current += ch;
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => row[h] = values[idx]);
            rows.push(row);
        }
    }
    return rows;
}

function makeKey(trackName, artistName) {
    return `${trackName.toLowerCase()}_${artistName.toLowerCase()}`.replace(/\s+/g, '_');
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return httpGet(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function searchYouTubeMultiple(query, max) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const html = await httpGet(url);
    const ids = [];
    const seen = new Set();
    const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
        if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
        if (ids.length >= max) break;
    }
    return ids;
}

async function scrapeDuration(videoId) {
    try {
        const html = await httpGet(`https://www.youtube.com/watch?v=${videoId}`);
        const m1 = html.match(/"lengthSeconds":"(\d+)"/);
        if (m1) return parseInt(m1[1]);
        const m2 = html.match(/"approxDurationMs":"(\d+)"/);
        if (m2) return Math.round(parseInt(m2[1]) / 1000);
        return null;
    } catch { return null; }
}

// Try to grab a title too so the user can sanity-check candidates
async function scrapeVideoMeta(videoId) {
    try {
        const html = await httpGet(`https://www.youtube.com/watch?v=${videoId}`);
        const dur = (() => {
            const m1 = html.match(/"lengthSeconds":"(\d+)"/);
            if (m1) return parseInt(m1[1]);
            const m2 = html.match(/"approxDurationMs":"(\d+)"/);
            if (m2) return Math.round(parseInt(m2[1]) / 1000);
            return null;
        })();
        let title = null;
        const tm = html.match(/"title":"([^"]+)","lengthSeconds"/);
        if (tm) {
            try { title = JSON.parse(`"${tm[1]}"`); } catch { title = tm[1]; }
        }
        let channel = null;
        const cm = html.match(/"ownerChannelName":"([^"]+)"/) || html.match(/"author":"([^"]+)"/);
        if (cm) {
            try { channel = JSON.parse(`"${cm[1]}"`); } catch { channel = cm[1]; }
        }
        return { duration: dur, title, channel };
    } catch { return { duration: null, title: null, channel: null }; }
}

function buildQueries(trackName, artistName) {
    const clean = trackName
        .replace(/\s*[-–]\s*(\d{4}\s*)?(Remaster(ed)?|Deluxe|Version Revisited|Director's Edit Version|Soundtrack Version).*$/i, '')
        .replace(/\s*\(feat\.[^)]*\)/gi, '')
        .replace(/\s*feat\.\s*.*/gi, '')
        .replace(/\s*[-–]\s*From\s+.*/i, '')
        .trim();
    const primary = artistName.split(';')[0].trim();
    return [...new Set([
        `${clean} ${primary} audio`,
        `${clean} ${primary} official audio`,
        `${clean} ${primary} lyrics`,
        `${clean} ${primary}`,
    ])];
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// Recognise an "official" upload — VEVO, the artist's auto-generated -Topic
// channel, or a title that announces itself as the official video/audio.
// When the currently-mapped video is official, we trust it and don't bother
// surfacing alternatives even if the duration drifts.
function classifyOfficial(title, channel) {
    const c = (channel || '').trim();
    const t = (title || '').trim();
    if (/VEVO$/i.test(c)) return 'vevo';
    if (/-\s*Topic$/i.test(c)) return 'topic';
    if (/\bofficial\s+(music\s+)?(video|audio|lyric\s*video)\b/i.test(t)) return 'titled';
    if (/\bvideo\s+oficial\b/i.test(t)) return 'titled';
    return null;
}

// ── identify violations ──────────────────────────────────────────────

function loadViolations() {
    const fixed = JSON.parse(fs.readFileSync(FIXED_MAPPINGS_FILE, 'utf8'));
    const live = JSON.parse(fs.readFileSync(VIDEO_MAPPINGS_FILE, 'utf8'));

    // Index every CSV row by (key) so we can know which playlists each track lives in
    const csvFiles = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    const trackInfo = new Map(); // key -> {trackName, artistName, spotifySec, playlists:[]}
    for (const file of csvFiles) {
        const playlistName = path.basename(file, '.csv').replace(/_/g, ' ');
        const rows = parseCSV(fs.readFileSync(path.join(CSV_DIR, file), 'utf8'));
        for (const row of rows) {
            const trackName = row['Track Name'];
            const artistName = row['Artist Name(s)'];
            const durationMs = parseInt(row['Duration (ms)']);
            if (!trackName || !artistName || !durationMs) continue;
            const key = makeKey(trackName, artistName);
            const spotifySec = Math.round(durationMs / 1000);
            if (!trackInfo.has(key)) {
                trackInfo.set(key, { trackName, artistName, spotifySec, playlists: [] });
            }
            const info = trackInfo.get(key);
            if (!info.playlists.includes(playlistName)) info.playlists.push(playlistName);
        }
    }

    const violations = [];
    for (const entry of Object.values(fixed)) {
        if (typeof entry.difference !== 'number') continue;
        if (Math.abs(entry.difference) <= THRESHOLD) continue;
        if (!entry.trackName || !entry.artistName) continue; // malformed row

        const key = makeKey(entry.trackName, entry.artistName);
        const info = trackInfo.get(key);
        const liveVideoId = live[key] || entry.videoId;

        violations.push({
            key,
            trackName: entry.trackName,
            artistName: entry.artistName,
            playlists: info ? info.playlists : (entry.playlist ? [entry.playlist] : []),
            spotifyDuration: entry.spotifyDuration,
            currentVideoId: liveVideoId,
            currentDurationCached: entry.youtubeDuration,
            currentDiffCached: entry.difference,
            liveMatchesFixed: liveVideoId === entry.videoId,
        });
    }

    // Worst first
    violations.sort((a, b) => Math.abs(b.currentDiffCached) - Math.abs(a.currentDiffCached));
    return violations;
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
    const all = loadViolations();
    console.log(`Identified ${all.length} violations with > ${THRESHOLD}s mismatch`);

    let existing = { generatedAt: null, threshold: THRESHOLD, violations: [] };
    if (fs.existsSync(OUT_FILE)) {
        try {
            existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
            if (!existing.violations) existing.violations = [];
        } catch { /* start fresh */ }
    }
    const done = new Map(existing.violations.map(v => [v.key, v]));
    console.log(`${done.size} already in data.json — will skip`);

    const out = {
        generatedAt: existing.generatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        threshold: THRESHOLD,
        violations: all.map(v => done.get(v.key) || { ...v, candidates: [], status: 'pending' }),
    };

    const save = () => {
        out.updatedAt = new Date().toISOString();
        fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
    };
    save();

    for (let i = 0; i < out.violations.length; i++) {
        const v = out.violations[i];
        if (v.status === 'done' || v.status === 'auto-resolved') continue;

        console.log(`\n[${i + 1}/${out.violations.length}] ${v.trackName} - ${v.artistName}  (Spotify ${v.spotifyDuration}s, cached YT ${v.currentDurationCached}s, cached diff ${v.currentDiffCached}s)`);

        // Re-scrape current video meta first — if the live mapping is already
        // healthy, skip the (slow) candidate search.
        try {
            const meta = await scrapeVideoMeta(v.currentVideoId);
            await delay(DELAY_DURATION);
            v.currentTitle = meta.title;
            v.currentChannel = meta.channel;
            if (meta.duration != null) {
                v.currentDuration = meta.duration;
                v.currentDiff = meta.duration - v.spotifyDuration;
            }
        } catch (e) { /* non-fatal */ }

        if (v.currentDuration != null && Math.abs(v.currentDiff) <= THRESHOLD) {
            console.log(`  current video is now within threshold (diff ${v.currentDiff}s) — auto-resolved`);
            v.candidates = [];
            v.status = 'auto-resolved';
            v.autoResolveReason = 'within-threshold';
            v.scrapedAt = new Date().toISOString();
            save();
            continue;
        }

        const official = classifyOfficial(v.currentTitle, v.currentChannel);
        if (official) {
            console.log(`  current video is on an official source (${official}: ${v.currentChannel}) — auto-resolved`);
            v.candidates = [];
            v.status = 'auto-resolved';
            v.autoResolveReason = `official-${official}`;
            v.scrapedAt = new Date().toISOString();
            save();
            continue;
        }

        const queries = buildQueries(v.trackName, v.artistName).slice(0, MAX_QUERIES);
        const candidates = [];
        const seenIds = new Set([v.currentVideoId]);

        for (const q of queries) {
            try {
                const ids = await searchYouTubeMultiple(q, MAX_CANDIDATES);
                await delay(DELAY_SEARCH);
                for (const id of ids) {
                    if (seenIds.has(id)) continue;
                    seenIds.add(id);
                    const meta = await scrapeVideoMeta(id);
                    await delay(DELAY_DURATION);
                    if (meta.duration == null) continue;
                    const diff = meta.duration - v.spotifyDuration;
                    candidates.push({
                        videoId: id,
                        duration: meta.duration,
                        diff,
                        absDiff: Math.abs(diff),
                        title: meta.title,
                        channel: meta.channel,
                        query: q,
                    });
                    if (candidates.length >= MAX_CANDIDATES) break;
                }
                if (candidates.length >= MAX_CANDIDATES) break;
            } catch (err) {
                console.log(`  query "${q}" failed: ${err.message}`);
            }
        }

        candidates.sort((a, b) => a.absDiff - b.absDiff);
        v.candidates = candidates;
        v.status = 'done';
        v.scrapedAt = new Date().toISOString();

        const best = candidates[0];
        if (best) console.log(`  best candidate: ${best.videoId} ${best.duration}s (diff ${best.diff}s)`);
        else      console.log(`  no candidates found`);

        save();
    }

    console.log(`\nDone. ${out.violations.length} violations written to ${OUT_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
