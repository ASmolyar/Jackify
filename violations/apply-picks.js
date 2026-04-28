// Apply selections exported from violations/index.html back to video-mappings.json.
//
// Usage:
//   node violations/apply-picks.js path/to/picks.json [--dry]
//
// picks.json shape:
//   { "<key>": { "videoId": "...", ... }, ... }

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const picksPath = args.find(a => !a.startsWith('--'));
if (!picksPath) {
    console.error('Usage: node violations/apply-picks.js path/to/picks.json [--dry]');
    process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const VIDEO_MAPPINGS_FILE = path.join(ROOT, 'video-mappings.json');
const DATA_FILE = path.join(__dirname, 'data.json');

const raw = JSON.parse(fs.readFileSync(picksPath, 'utf8'));
const keepCurrent = Array.isArray(raw.__resolved_keep_current) ? raw.__resolved_keep_current : [];
const picks = { ...raw };
delete picks.__resolved_keep_current;

const mappings = JSON.parse(fs.readFileSync(VIDEO_MAPPINGS_FILE, 'utf8'));

let changed = 0, unchanged = 0, added = 0;
for (const [key, pick] of Object.entries(picks)) {
    if (!pick || !pick.videoId) continue;
    const cur = mappings[key];
    if (cur === pick.videoId) { unchanged++; continue; }
    console.log(`${cur ? 'UPDATE' : 'ADD   '}  ${key}  ${cur || '(none)'} -> ${pick.videoId}`);
    mappings[key] = pick.videoId;
    if (cur) changed++; else added++;
}

console.log(`\n${changed} updated, ${added} added, ${unchanged} already correct`);

if (dry) {
    console.log('Dry run — no mapping file written.');
} else if (changed + added > 0) {
    const backup = VIDEO_MAPPINGS_FILE + '.bak.' + Date.now();
    fs.copyFileSync(VIDEO_MAPPINGS_FILE, backup);
    fs.writeFileSync(VIDEO_MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
    console.log(`Wrote ${VIDEO_MAPPINGS_FILE} (backup at ${backup})`);
} else {
    console.log('Nothing to write to mappings.');
}

// Stamp picks AND "keep current" resolutions into data.json so they stop
// reappearing when the generator is re-run.
const pickKeys = Object.keys(picks).filter(k => picks[k] && picks[k].videoId);
if (pickKeys.length || keepCurrent.length) {
    if (!fs.existsSync(DATA_FILE)) {
        console.log(`\n${pickKeys.length + keepCurrent.length} resolution keys ignored — no data.json to update.`);
    } else {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const wantPicked = new Set(pickKeys);
        const wantKept   = new Set(keepCurrent);
        let pickedStamped = 0, keptStamped = 0;
        for (const v of data.violations) {
            if (wantPicked.has(v.key)) {
                v.status = 'auto-resolved';
                v.autoResolveReason = 'manual-picked';
                pickedStamped++;
            } else if (wantKept.has(v.key)) {
                v.status = 'auto-resolved';
                v.autoResolveReason = 'manual-keep-current';
                v.candidates = v.candidates || [];
                keptStamped++;
            }
        }
        console.log(`\n${pickedStamped}/${pickKeys.length} picked entries stamped, ${keptStamped}/${keepCurrent.length} keep-current entries stamped in data.json`);
        if (!dry && (pickedStamped + keptStamped) > 0) {
            data.updatedAt = new Date().toISOString();
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            console.log(`Wrote ${DATA_FILE}`);
        }
    }
}
