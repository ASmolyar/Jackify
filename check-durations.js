// Duration Validation Console Script
// Run this in the browser console while on the Jackify app page

(async function() {
    console.log('🎵 YouTube Duration Validation Starting...\n');

    const THRESHOLD = 10; // seconds
    const CSV_BASE = 'https://jackdutton8.blob.core.windows.net/spotify-playlists/csvs/';

    // All playlist CSV files
    const csvFiles = [
        "70°_finally.csv", "Aaroncore.csv", "Avett_addiction_.csv",
        "Boys_Summer_'22.csv", "CAKE.csv", "Costume_Change.csv",
        "EZ🎯_.csv", "Early_Summer_'22.csv", "Fall_'21.csv",
        "For_whom_the_bell_tolls.csv", "I'm_a_crepe_I'm_a_weirdough.csv",
        "Liked_Songs.csv", "Late_Summer_'22.csv", "MAKE_ME_AN_OFFER.csv",
        "Mom's_Jams.csv", "My_2023_Playlist_in_a_Bottle.csv",
        "My_Ever-Evolving_Music_Taste.csv", "My_playlist_#82.csv",
        "Old_Timey_Jazz.csv", "Old_summer.csv", "On_Repeat.csv",
        "Repeat_Rewind.csv", "Rowing_Trip_'21.csv", "SAE.csv",
        "Spring_'22.csv", "Stagger.csv", "Summer_'21.csv",
        "Top_Songs_ever_as_of_may.csv", "Top_Tracks_11:29:2021_(last_6_months).csv",
        "Triton.csv", "Vulfpeck😩.csv", "Winter_'22.csv",
        "Your_Top_Songs_2022.csv", "Your_Top_Songs_2023.csv",
        "Your_Top_Songs_2024.csv", "Your_Top_Songs_2025.csv",
        "all_night_revival.csv", "barn_dancing_isn't_real.csv",
        "brayden_from_boone.csv", "bring_it_on_back.csv",
        "cartoon_guitar.csv", "cloud_lakes.csv", "dead_long_winter.csv",
        "driving_off.csv", "ex-wife_for_a_reason.csv", "finally.csv",
        "fradboy.csv", "freely_flowing.csv", "funky.csv",
        "hell_bound.csv", "high_and_lonesome,_hard_and_strong.csv",
        "hood_cookout.csv", "hopeless_romantic_(crash_out).csv",
        "hype.csv", "i_-_85.csv", "idk_what_they're_saying_but_it's_funky_fresh_(my_version).csv",
        "im_feelin'_romantical.csv", "is_this_tequila?.csv",
        "it_just_means_more.csv", "jam_ideas.csv", "junior.csv",
        "keep_away.csv", "leaving_is_the_hardest_part.csv",
        "male_manipulated.csv", "medicine_to_me.csv", "moonlight_on_the_water.csv",
        "night_into_day.csv", "nowhere_bound.csv", "on_the_run.csv",
        "playlist_of_despair_and_yearning.csv", "post-camp_vibes.csv",
        "read_the_first_letters.csv", "reminds_me_of_friends.csv",
        "right_back_at_you.csv", "ript.csv", "roadtrip!.csv",
        "rockin_the_boat.csv", "soft_jams.csv", "something_about_us.csv",
        "staring_out_the_window.csv", "strokin'_it.csv",
        "take_me_back.csv", "textbook_panderin'.csv", "the_pressure.csv",
        "tunes_to_learn.csv", "uno_van.csv", "urban?.csv",
        "villain_arc.csv", "vodka_and_ginger_ale.csv",
        "was_pop_is_rock.csv", "way_back_when.csv", "whiskey_bent.csv",
        "white_lines.csv", "you_should_be_dancing.csv",
        ""crackle_barrel_".csv", "🏄_🎸.csv", "🤠🎸.csv"
    ];

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

    async function searchYouTube(trackName, artistName) {
        const cacheKey = `yt_${trackName}_${artistName}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;

        try {
            const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${process.env.YOUTUBE_API_KEY}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                localStorage.setItem(cacheKey, videoId);
                return videoId;
            }
        } catch (err) {
            console.error('Search error:', err);
        }

        return null;
    }

    async function getVideoDuration(videoId) {
        return new Promise((resolve) => {
            if (!window.ytPlayer) {
                resolve(null);
                return;
            }

            ytPlayer.loadVideoById(videoId);
            let attempts = 0;

            const checkDuration = setInterval(() => {
                const duration = ytPlayer.getDuration();
                attempts++;

                if (duration > 0) {
                    clearInterval(checkDuration);
                    ytPlayer.stopVideo();
                    resolve(Math.round(duration));
                } else if (attempts > 50) { // 5 second timeout
                    clearInterval(checkDuration);
                    resolve(null);
                }
            }, 100);
        });
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const allMismatches = [];
    let totalTracks = 0;
    let totalChecked = 0;

    for (const csvFile of csvFiles) {
        const playlistName = csvFile.replace(/_/g, ' ').replace('.csv', '');
        console.log(`\n📁 Checking: ${playlistName}`);

        try {
            const response = await fetch(CSV_BASE + csvFile);
            const csvText = await response.text();
            const tracks = parseCSV(csvText);

            totalTracks += tracks.length;
            let playlistMismatches = 0;

            for (let i = 0; i < Math.min(tracks.length, 5); i++) { // Test first 5 tracks per playlist
                const track = tracks[i];
                const trackName = track['Track Name'];
                const artistName = track['Artist Name(s)'];
                const spotifyDurationMs = parseInt(track['Duration (ms)']);
                const spotifyDurationSec = Math.round(spotifyDurationMs / 1000);

                try {
                    const videoId = await searchYouTube(trackName, artistName);
                    if (!videoId) {
                        allMismatches.push({
                            playlist: playlistName,
                            track: `${trackName} - ${artistName}`,
                            spotify: formatDuration(spotifyDurationSec),
                            youtube: 'Not found',
                            diff: 'N/A'
                        });
                        playlistMismatches++;
                        continue;
                    }

                    const youtubeDurationSec = await getVideoDuration(videoId);
                    if (!youtubeDurationSec) {
                        allMismatches.push({
                            playlist: playlistName,
                            track: `${trackName} - ${artistName}`,
                            spotify: formatDuration(spotifyDurationSec),
                            youtube: 'Load error',
                            diff: 'N/A'
                        });
                        playlistMismatches++;
                        continue;
                    }

                    const difference = Math.abs(spotifyDurationSec - youtubeDurationSec);
                    if (difference > THRESHOLD) {
                        allMismatches.push({
                            playlist: playlistName,
                            track: `${trackName} - ${artistName}`,
                            spotify: formatDuration(spotifyDurationSec),
                            youtube: formatDuration(youtubeDurationSec),
                            diff: `${difference}s`
                        });
                        playlistMismatches++;
                    }

                    totalChecked++;
                } catch (err) {
                    console.error(`  Error: ${trackName}`, err);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (playlistMismatches > 0) {
                console.log(`  ⚠️  ${playlistMismatches} issues found`);
            } else {
                console.log(`  ✅ All checked tracks match`);
            }

        } catch (err) {
            console.error(`  ❌ Error loading playlist: ${err.message}`);
        }
    }

    // Summary
    console.log('\n\n📊 SUMMARY\n');
    console.log(`Total tracks checked: ${totalChecked}`);
    console.log(`Duration mismatches: ${allMismatches.length}`);
    console.log(`Success rate: ${((totalChecked - allMismatches.length) / totalChecked * 100).toFixed(1)}%`);

    if (allMismatches.length > 0) {
        console.log('\n⚠️  MISMATCHES:\n');
        console.table(allMismatches);
    }

    console.log('\n✅ Validation complete!');
})();
