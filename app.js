// Blob configuration
let BLOB_BASE_URL = '';

// Load blob config if available
fetch('blob-config.json')
    .then(res => res.json())
    .then(config => {
        BLOB_BASE_URL = config.BLOB_BASE_URL;
        console.log('Using Vercel Blob storage:', BLOB_BASE_URL);
        // Re-render playlists now that we have the blob URL
        if (typeof renderPlaylistGrid === 'function') renderPlaylistGrid();
        if (typeof renderSidebar === 'function') renderSidebar();
    })
    .catch(() => {
        console.log('Using local images (blob-config.json not found)');
    });

// Load video mappings if available
fetch('video-mappings.json')
    .then(res => res.json())
    .then(mappings => {
        videoMappings = mappings;
        console.log(`Loaded ${Object.keys(videoMappings).length} video mappings`);
    })
    .catch(() => {
        console.log('No video mappings found, will use YouTube API');
    });

// Helper to get image URL (blob or local)
function getImageUrl(path) {
    if (!path) return '';
    if (BLOB_BASE_URL) {
        return `${BLOB_BASE_URL}/${path}`;
    }
    return path; // fallback to local
}

// Playlist data
const playlists = [
    { name: "Liked Songs", url: "https://open.spotify.com/collection/tracks", img: "pfps/Liked Songs.jpeg", songs: 241, date: "2025-12-18", subtitle: null },
    { name: "On Repeat", url: "https://open.spotify.com/playlist/49YeV4mj1uXMMi8FIu97V7", img: "pfps/On Repeat.jpeg", songs: 30, date: "2025-12-18", subtitle: null, description: "This playlist was collected posthumously.", category: "madeForYou", author: "Spotify" },
    { name: "Repeat Rewind", url: "https://open.spotify.com/playlist/2H4u1iNige1NX86pEWBcPv", img: "pfps/Repeat Rewind.jpg", songs: 30, date: "2025-12-18", subtitle: null, description: "This playlist was collected posthumously.", category: "madeForYou", author: "Spotify" },
    { name: "Jack's Top Songs 2022", url: "https://open.spotify.com/playlist/0yhPPOU0ZTLELil0deZEiH", img: "pfps/Jack's Top Songs 2022.jpeg", songs: 101, date: "2022-12-01", subtitle: null, category: "madeForYou", author: "Spotify" },
    { name: "Jack's Top Songs 2023", url: "https://open.spotify.com/playlist/7qt2dWTQGyxGgamEvn8H0R", img: "pfps/Jack's Top Songs 2023.jpg", songs: 100, date: "2023-12-01", subtitle: null, category: "madeForYou", author: "Spotify" },
    { name: "Jack's Top Songs 2024", url: "https://open.spotify.com/playlist/51WeFWEG5W7RuoB9q4v83q", img: "pfps/Jack's Top Songs 2024.jpeg", songs: 100, date: "2024-12-01", subtitle: null, category: "madeForYou", author: "Spotify" },
    { name: "Jack's Top Songs 2025", url: "https://open.spotify.com/playlist/2kG3P3jLUlualM0r8oZ1Ch", img: "pfps/Jack's Top Songs 2025.jpeg", songs: 100, date: "2025-12-01", subtitle: null, category: "madeForYou", author: "Spotify" },
    { name: "it just means more", url: "https://open.spotify.com/playlist/5sPfoo3F9LwNsq1pRNFjGR", img: "pfps/it just means more.jpeg", songs: 6, date: "2024-05-16", subtitle: null },
    { name: "night into day", url: "https://open.spotify.com/playlist/59VUVVewEo6b5jxUdvW9FJ", img: "pfps/night into day.jpeg", songs: 23, date: "2023-06-15", subtitle: null },
    { name: "Spring '22", url: "https://open.spotify.com/playlist/4mgL620ffxj4VYuviRl4F8", img: "pfps/Spring ‘22.jpeg", songs: 81, date: "2022-04-01", subtitle: null },
    { name: "ex-wife for a reason", url: "https://open.spotify.com/playlist/7JHNXZ4z663rArEs0YoRwK", img: "pfps/ex-wife for a reason.jpeg", songs: 44, date: "2024-09-25", subtitle: null },
    { name: "freely flowing", url: "https://open.spotify.com/playlist/73wWvTQ01Hn9qnqmg69J0S", img: "pfps/freely flowing.jpeg", songs: 35, date: "2023-02-22", subtitle: null },
    { name: "male manipulated", url: "https://open.spotify.com/playlist/1WWr5ZT2D2NKmkDZUch7Qc", img: "pfps/male manipulated.jpeg", songs: 52, date: "2023-01-11", subtitle: "The last two letters are irrelevant" },
    { name: "ript", url: "https://open.spotify.com/playlist/2bzYU0ZU0zjp0PYFVYmHN7", img: "pfps/ript.jpeg", songs: 21, date: "2023-08-22", subtitle: null },
    { name: "funky", url: "https://open.spotify.com/playlist/4oRbkExlGSx4fi0S98xNj8", img: "pfps/funky.jpeg", songs: 10, date: "2023-09-08", subtitle: null },
    { name: "I'm a crepe I'm a weirdough", url: "https://open.spotify.com/playlist/5TARRDc4Nt74GEYB6hkPW7", img: "pfps/I’m a crepe I’m a weirdough.jpeg", songs: 39, date: "2023-12-18", subtitle: null },
    { name: "SAE", url: "https://open.spotify.com/playlist/3aq7FULzFT8znmlWODqv2L", img: "pfps/SAE.jpeg", songs: 1, date: "2025-05-26", subtitle: null },
    { name: "junior", url: "https://open.spotify.com/playlist/4W3cOeADPWyi1mltiT1FAL", img: "pfps/junior.jpeg", songs: 34, date: "2022-09-14", subtitle: "Bruh what even was September\u{1F602}\u{1F602}" },
    { name: "Rowing Trip '21", url: "https://open.spotify.com/playlist/6GN9yE7qAD3B0vgOnYCUqM", img: "pfps/Rowing Trip '21.jpeg", songs: 54, date: "2022-01-08", subtitle: "getting gunned down in the streets of miami" },
    { name: "\u201Ccrackle barrel \u201D", url: "https://open.spotify.com/playlist/6LTDwWwkvAeuCTunkqqLUX", img: "pfps/\u201Ccrackle barrel \u201C.jpeg", songs: 26, date: "2023-10-11", subtitle: null },
    { name: "Old summer", url: "https://open.spotify.com/playlist/62w94hFNNqm2lw74LO70Pg", img: "pfps/Old summer.jpeg", songs: 26, date: "2023-03-19", subtitle: null },
    { name: "driving off", url: "https://open.spotify.com/playlist/0ICnWhUNvPhHY9zBWhgFAG", img: "pfps/driving off.jpeg", songs: 37, date: "2023-04-28", subtitle: null },
    { name: "nowhere bound", url: "https://open.spotify.com/playlist/3OIKVnP7WCWytKDYgNAqq6", img: "pfps/nowhere bound.jpeg", songs: 27, date: "2024-05-13", subtitle: null },
    { name: "My Ever-Evolving Music Taste", url: "https://open.spotify.com/playlist/5Iv7DHWkqADHFenHas0Fyp", img: "pfps/My Ever-Evolving Music Taste.jpeg", songs: 66, date: "2021-11-18", subtitle: "take me back to the simplicity" },
    { name: "is this tequila?", url: "https://open.spotify.com/playlist/0SZT2EDZ36dD2ygwvkbWFI", img: "pfps/is this tequila?.jpeg", songs: 52, date: "2025-04-20", subtitle: null },
    { name: "Mom's Jams", url: "https://open.spotify.com/playlist/07Lex2t3ZGT4kCuYDjlbmS", img: "pfps/Mom’s Jams.jpeg", songs: 46, date: "2021-12-20", subtitle: null },
    { name: "hype", url: "https://open.spotify.com/playlist/4kLNT2Hu2ZCaPuq6VEWkEl", img: "pfps/hype.jpeg", songs: 46, date: "2021-12-16", subtitle: null },
    { name: "staring out the window", url: "https://open.spotify.com/playlist/689hZij4qDHSyEwWRzvv1I", img: "pfps/staring out the window.jpeg", songs: 17, date: "2022-09-19", subtitle: "Bro was in his feels" },
    { name: "\u{1F920}\u{1F3B8}", url: "https://open.spotify.com/playlist/7JcObha08QuYEnZnjn7ty1", img: "pfps/\u{1F920}\u{1F3B8}.jpeg", songs: 57, date: "2021-10-11", subtitle: null },
    { name: "Fall '21", url: "https://open.spotify.com/playlist/0YTm5U5LJwPNYCr1TNfDeL", img: "pfps/Fall '21.jpeg", songs: 79, date: "2021-11-18", subtitle: null },
    { name: "high and lonesome, hard and strong", url: "https://open.spotify.com/playlist/3bbr0o359oR1x39VMFQurh", img: "pfps/high and lonesome, hard and strong.jpeg", songs: 22, date: "2025-03-28", subtitle: null },
    { name: "uno van", url: "https://open.spotify.com/playlist/6niLcRxDFr9kOvDqQ1bGXf", img: "pfps/uno van.jpeg", songs: 37, date: "2022-09-05", subtitle: "Shoutout to our poor drivers" },
    { name: "soft jams", url: "https://open.spotify.com/playlist/6xIyn93QMArBfeKxeemejX", img: "pfps/soft jams.jpeg", songs: 42, date: "2022-01-03", subtitle: null },
    { name: "hood cookout", url: "https://open.spotify.com/playlist/0OYFUr6GjFKwaAUKyzBDdK", img: "pfps/hood cookout.jpeg", songs: 40, date: "2024-08-19", subtitle: null },
    { name: "Summer '21", url: "https://open.spotify.com/playlist/6rFfOLVdRJgV6TppK24Ug3", img: "pfps/Summer '21.jpeg", songs: 127, date: "2021-08-10", subtitle: null },
    { name: "\u{1F3C4} \u{1F3B8}", url: "https://open.spotify.com/playlist/2HgbFyjw9dNiZcdCAtIR2I", img: "pfps/\u{1F3C4} \u{1F3B8}.jpeg", songs: 67, date: "2023-01-03", subtitle: null },
    { name: "smoke bubbles", url: "https://open.spotify.com/playlist/4DSzS7eSU9gOWJtbngVtvd", img: "pfps/smoke bubbles.jpeg", songs: 10, date: "2023-08-21", subtitle: null },
    { name: "cartoon guitar", url: "https://open.spotify.com/playlist/29zQ4JHpJFHWSd74wmz0XN", img: "pfps/cartoon guitar.jpeg", songs: 6, date: "2023-08-01", subtitle: null },
    { name: "rockin the boat", url: "https://open.spotify.com/playlist/6xp9MpgyuaIO762FvmOcov", img: "pfps/rockin the boat.jpeg", songs: 33, date: "2023-03-13", subtitle: null },
    { name: "hell bound", url: "https://open.spotify.com/playlist/1mdVBOhTppSl15ctzMEusN", img: "pfps/hell bound.jpeg", songs: 42, date: "2024-08-19", subtitle: null },
    { name: "bring it on back", url: "https://open.spotify.com/playlist/44YUJNUPOK10mDCnlYIQKq", img: "pfps/bring it on back.jpeg", songs: 41, date: "2025-09-03", subtitle: null },
    { name: "keep away", url: "https://open.spotify.com/playlist/4kw13qPLbp0F7uT0YsCB92", img: "pfps/keep away.jpeg", songs: 57, date: "2024-06-25", subtitle: null },
    { name: "vodka and ginger ale", url: "https://open.spotify.com/playlist/0kyl89XxvtIsh2gpdlLqCa", img: "pfps/vodka and ginger ale.jpeg", songs: 30, date: "2024-09-13", subtitle: null },
    { name: "playlist of despair and yearning", url: "https://open.spotify.com/playlist/0KZdlD3t5lCrGWsoOTMn0c", img: "pfps/playlist of despair and yearning.jpeg", songs: 24, date: "2025-09-09", subtitle: null },
    { name: "roadtrip!", url: "https://open.spotify.com/playlist/5ca055G3SdGoXVkM3R3iN0", img: "pfps/roadtrip!.jpeg", songs: 100, date: "2022-10-07", subtitle: null },
    { name: "read the first letters", url: "https://open.spotify.com/playlist/5cPnbZA1947C9WtqJ43XxM", img: "pfps/read the first letters.jpeg", songs: 15, date: "2022-10-07", subtitle: "just read the title" },
    { name: "idk what they're saying but it's funky fresh (my version)", url: "https://open.spotify.com/playlist/5gP8WtD412ABZFAP01BX87", img: "pfps/idk what they’re saying but it’s funky fresh (my version).jpeg", songs: 38, date: "2022-08-17", subtitle: "My version is better fuck you jackson" },
    { name: "moonlight on the water", url: "https://open.spotify.com/playlist/6ruqRsH8EqqUD0xoFPBCnG", img: "pfps/moonlight on the water.jpeg", songs: 25, date: "2022-08-06", subtitle: null },
    { name: "70\u00B0 finally", url: "https://open.spotify.com/playlist/01NxghfAYnfQQei3zH6530", img: "pfps/70\u00B0 finally.jpeg", songs: 45, date: "2025-02-28", subtitle: null },
    { name: "villain arc", url: "https://open.spotify.com/playlist/2AbB1FUt3cxcTChmNYr7hu", img: "pfps/villain arc.jpeg", songs: 9, date: "2022-10-23", subtitle: "Didn't really follow thru on this idea" },
    { name: "cloud lakes", url: "https://open.spotify.com/playlist/215b1549zo2VRIQ5CAB31k", img: "pfps/cloud lakes.jpeg", songs: 36, date: "2023-10-14", subtitle: null },
    { name: "strokin' it", url: "https://open.spotify.com/playlist/5w1OBCYPgKqmo4iUwGjLlR", img: "pfps/strokin' it.jpeg", songs: 60, date: "2023-07-27", subtitle: null },
    { name: "Winter '22", url: "https://open.spotify.com/playlist/2nkcWSphgIVIEd2wyA4yoR", img: "pfps/Winter ‘22.jpeg", songs: 69, date: "2022-02-16", subtitle: null },
    { name: "way back when", url: "https://open.spotify.com/playlist/0qL9S45URxS8SO8AMS6Kei", img: "pfps/way back when.jpeg", songs: 35, date: "2023-03-06", subtitle: null },
    { name: "im feelin' romantical", url: "https://open.spotify.com/playlist/5KyX3BvteqwZdFDg752EZ4", img: "pfps/im feelin' romantical.jpeg", songs: 25, date: "2022-08-30", subtitle: null },
    { name: "take me back", url: "https://open.spotify.com/playlist/22ZZvdO5INxEbVpEqGXWpS", img: "pfps/take me back.jpeg", songs: 9, date: "2025-06-23", subtitle: null },
    { name: "MAKE ME AN OFFER", url: "https://open.spotify.com/playlist/5IroSDXzQ982pHQRR3jaAT", img: "pfps/MAKE ME AN OFFER.jpeg", songs: 47, date: "2023-10-12", subtitle: null },
    { name: "Triton", url: "https://open.spotify.com/playlist/0ukxgKhTEgPmVVD0pUDdjn", img: "pfps/Triton.jpeg", songs: 19, date: "2023-01-11", subtitle: null },
    { name: "something about us", url: "https://open.spotify.com/playlist/6lbD5kUMBKknwQwVhcmJzN", img: "pfps/something about us.jpeg", songs: 19, date: "2023-07-30", subtitle: null },
    { name: "Top Tracks 11/29/2021 (last 6 months)", url: "https://open.spotify.com/playlist/1OutsIXGodH2mBO24I2OiW", img: "pfps/Top Tracks 11:29:2021 (last 6 months).jpeg", songs: 50, date: "2021-11-29", subtitle: "Your favorite tracks last 6 months as of 11/29/2021. Created by statsforspotify.com" },
    { name: "whiskey bent", url: "https://open.spotify.com/playlist/353Y8McXMV4r6gB4bV6Wtc", img: "pfps/whiskey bent.jpeg", songs: 34, date: "2024-08-20", subtitle: null },
    { name: "right back at you", url: "https://open.spotify.com/playlist/1zV4ZyK8eMWmNCcGuNh4oo", img: "pfps/right back at you.jpeg", songs: 38, date: "2025-07-18", subtitle: null },
    { name: "Late Summer '22", url: "https://open.spotify.com/playlist/0TOOW74TqYTBRAinIiG7nv", img: "pfps/Late Summer ‘22.jpeg", songs: 37, date: "2022-08-06", subtitle: null },
    { name: "textbook panderin'", url: "https://open.spotify.com/playlist/0MQpy1oC3c7vPh4BC0TT88", img: "pfps/textbook panderin’.jpeg", songs: 31, date: "2024-05-03", subtitle: null },
    { name: "jam ideas", url: "https://open.spotify.com/playlist/6nUlFYZXvAPdDG26sdV4HJ", img: "pfps/jam ideas.jpeg", songs: 16, date: "2024-10-16", subtitle: null },
    { name: "My playlist #82", url: "https://open.spotify.com/playlist/5qU7JubxOSX4atFGmKSiY3", img: "pfps/My playlist #82.jpeg", songs: 1, date: "2024-08-23", subtitle: null },
    { name: "CAKE", url: "https://open.spotify.com/playlist/29vF8G11tLC7q8pbueadI5", img: "pfps/CAKE.jpeg", songs: 60, date: "2025-08-27", subtitle: null },
    { name: "finally", url: "https://open.spotify.com/playlist/15nG7kUtj6rMQwOfwUIsFX", img: "pfps/finally.jpeg", songs: 33, date: "2022-12-12", subtitle: "Lasted about a week. Foo fighters good tho" },
    { name: "barn dancing isn't real", url: "https://open.spotify.com/playlist/6TokdHaAxWAu0PLE1pmfj0", img: "pfps/barn dancing isn’t real.jpeg", songs: 62, date: "2023-07-18", subtitle: "there's no knots in bowling" },
    { name: "Stagger", url: "https://open.spotify.com/playlist/6BpvtlcnUYqHdp8lrVzkHr", img: "pfps/Stagger.jpeg", songs: 42, date: "2022-04-15", subtitle: null },
    { name: "Old Timey Jazz", url: "https://open.spotify.com/playlist/0QNWiSfwkeum4eGf3ijTVw", img: "pfps/Old Timey Jazz.jpeg", songs: 38, date: "2021-10-25", subtitle: null },
    { name: "was pop is rock", url: "https://open.spotify.com/playlist/3uPZX0ScFjO31y0APeJ6Aw", img: "pfps/was pop is rock.jpeg", songs: 25, date: "2023-11-10", subtitle: null },
    { name: "Avett addiction", url: "https://open.spotify.com/playlist/0Dw24Hw8sjJBFfigwGzwsp", img: "pfps/Avett addiction.jpeg", songs: 75, date: "2023-08-06", subtitle: null },
    { name: "reminds me of friends", url: "https://open.spotify.com/playlist/4gzoXDjsyGdFCpbfg8S66h", img: "pfps/reminds me of friends.jpeg", songs: 78, date: "2022-01-21", subtitle: null },
    { name: "i - 85", url: "https://open.spotify.com/playlist/5rLDqdJmBBgy3OcP6Fipan", img: "pfps/i - 85.jpeg", songs: 45, date: "2023-09-16", subtitle: null },
    { name: "the pressure", url: "https://open.spotify.com/playlist/61TnNVt1xo7khTB7jcJxuX", img: "pfps/the pressure.jpeg", songs: 39, date: "2024-04-08", subtitle: null },
    { name: "fradboy", url: "https://open.spotify.com/playlist/1payFd3nIhrCmtHOjDDTtD", img: "pfps/fradboy.jpeg", songs: 24, date: "2022-10-05", subtitle: null },
    { name: "leaving is the hardest part", url: "https://open.spotify.com/playlist/3uY8rf8UgAXG3JdnhZn4sG", img: "pfps/leaving is the hardest part.jpeg", songs: 13, date: "2023-04-13", subtitle: null },
    { name: "tunes to learn", url: "https://open.spotify.com/playlist/4i98YH79oNbtQw0bXrryxA", img: "pfps/tunes to learn.jpeg", songs: 18, date: "2022-12-04", subtitle: "So much for that" },
    { name: "all night revival", url: "https://open.spotify.com/playlist/00y8R2ONTnA4wffUowxPuZ", img: "pfps/all night revival.jpeg", songs: 46, date: "2023-09-02", subtitle: null },
    { name: "Aaroncore", url: "https://open.spotify.com/playlist/0WOYwf8th5AFSwUpJ31ru4", img: "pfps/Aaroncore.jpeg", songs: 38, date: "2022-06-12", subtitle: null },
    { name: "medicine to me", url: "https://open.spotify.com/playlist/0PFIjCT7TA0wd2CHFLJeOk", img: "pfps/medicine to me.jpeg", songs: 19, date: "2024-11-14", subtitle: null },
    { name: "white lines", url: "https://open.spotify.com/playlist/2UxOhFbTR6taftNnUJ9wIL", img: "pfps/white lines.jpeg", songs: 60, date: "2024-02-09", subtitle: null },
    { name: "hopeless romantic (crash out)", url: "https://open.spotify.com/playlist/1asKzsWsB6ACH83rGDBnyo", img: "pfps/hopeless romantic (crash out).jpeg", songs: 36, date: "2024-10-24", subtitle: null },
    { name: "EZ\u{1F3AF}", url: "https://open.spotify.com/playlist/5iqNTuQ7iJGwvfH3XVoPAe", img: "pfps/EZ\u{1F3AF}.jpeg", songs: 25, date: "2025-03-13", subtitle: null },
    { name: "brayden from boone", url: "https://open.spotify.com/playlist/6PtLr3cz7tHic5ZagfsMjn", img: "pfps/brayden from boone.jpeg", songs: 115, date: "2023-09-16", subtitle: null },
    { name: "post-camp vibes", url: "https://open.spotify.com/playlist/3v9YOUlpASsfHRdWRXrFit", img: "pfps/post-camp vibes.jpeg", songs: 29, date: "2022-07-16", subtitle: null },
    { name: "Boys Summer '22", url: "https://open.spotify.com/playlist/125C571N44fuTLYyTJw2wa", img: "pfps/Boys Summer ‘22.jpeg", songs: 102, date: "2022-08-20", subtitle: "Jungle juice ass playlist" },
    { name: "For whom the bell tolls", url: "https://open.spotify.com/playlist/1fnasuuYu6b6Ehj8oNaoyT", img: "pfps/For whom the bell tolls.jpeg", songs: 8, date: "2024-01-06", subtitle: null },
    { name: "My 2023 Playlist in a Bottle", url: "https://open.spotify.com/playlist/1TRo41tKA2v7DkEGcxfO1Y", img: "pfps/My 2023 Playlist in a Bottle.jpeg", songs: 5, date: "2024-01-06", subtitle: null },
    { name: "urban?", url: "https://open.spotify.com/playlist/1kRmNZRVvo03GiXqrsKASf", img: "pfps/urban?.jpeg", songs: 32, date: "2023-01-04", subtitle: null },
    { name: "on the run", url: "https://open.spotify.com/playlist/0Sy0jg9BHCPt8zapX7mddz", img: "pfps/on the run.jpeg", songs: 31, date: "2023-10-12", subtitle: null },
    { name: "Costume Change", url: "https://open.spotify.com/playlist/6rKtERvWHgOpFLHXCJQec2", img: "pfps/Costume Change.jpeg", songs: 18, date: "2022-03-24", subtitle: null },
    { name: "dead long winter", url: "https://open.spotify.com/playlist/6au7w2ZIEyJaj3EBQFI89d", img: "pfps/dead long winter.jpeg", songs: 36, date: "2024-11-09", subtitle: null },
    { name: "Vulfpeck\u{1F629}", url: "https://open.spotify.com/playlist/2EMGowPfyLCY8uKBVTbVpC", img: "pfps/Vulfpeck\u{1F629}.jpeg", songs: 51, date: "2022-01-08", subtitle: null },
    { name: "Top Songs ever as of may", url: "https://open.spotify.com/playlist/2KbRxO6RzCgPA0frrCtlUI", img: "pfps/Top Songs ever as of may.jpeg", songs: 50, date: "2022-05-02", subtitle: null },
    { name: "Early Summer '22", url: "https://open.spotify.com/playlist/5GhelpVGZzWmdAko94qmt4", img: "pfps/Early Summer ‘22.jpeg", songs: 54, date: "2022-05-24", subtitle: null },
    { name: "you should be dancing", url: "https://open.spotify.com/playlist/4o8cjrLgyMjqWGGFWz9N9p", img: "pfps/you should be dancing.jpeg", songs: 32, date: "2023-04-19", subtitle: null },
];

// State
let currentView = 'home';
let currentPlaylist = null;
let searchTerm = '';
let currentFilter = 'all';

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format duration
function formatDuration(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Load album artwork - try local first, fallback to Spotify oEmbed API
async function fetchAlbumArt(trackId, imgElement) {
    if (!trackId || !imgElement) return;

    // Try local file first
    const localPath = `album-art/${trackId}.jpg`;
    imgElement.src = localPath;

    imgElement.onload = () => {
        imgElement.classList.remove('skeleton');
    };

    imgElement.onerror = async () => {
        // Local file not found, fetch from Spotify oEmbed API
        try {
            const response = await fetch(`https://open.spotify.com/oembed?url=spotify:track:${trackId}`);
            if (!response.ok) throw new Error('oEmbed fetch failed');

            const data = await response.json();
            if (data.thumbnail_url) {
                imgElement.src = data.thumbnail_url;
                imgElement.onload = () => {
                    imgElement.classList.remove('skeleton');
                };
            } else {
                imgElement.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching album art:', error);
            imgElement.style.display = 'none';
        }
    };
}

// CSV filename mapping
function getCSVFilename(playlistName) {
    const overrides = {
        "is this tequila?": "is_this_tequila.csv",
        "urban?": "urban.csv",
        "Top Tracks 11/29/2021 (last 6 months)": "Top_Tracks_11292021_(last_6_months).csv",
        "Avett addiction": "Avett_addiction_.csv",
        "EZ\u{1F3AF}": "EZ\u{1F3AF}_.csv",
        "I'm a crepe I'm a weirdough": "I\u2019m_a_crepe_I\u2019m_a_weirdough_.csv",
        "ript": "ript_.csv",
        "\u{1F3C4} \u{1F3B8}": "\u{1F3C4}_\u{1F3B8}_.csv",
        "\u201Ccrackle barrel \u201D": "\u201Ccrackle_barrel_\u201C.csv",
        "Mom's Jams": "Mom\u2019s_Jams.csv",
        "Winter '22": "Winter_\u201822.csv",
        "Spring '22": "Spring_\u201822.csv",
        "Early Summer '22": "Early_Summer_\u201822.csv",
        "Late Summer '22": "Late_Summer_\u201822.csv",
        "Boys Summer '22": "Boys_Summer_\u201822.csv",
        "idk what they're saying but it's funky fresh (my version)": "idk_what_they\u2019re_saying_but_it\u2019s_funky_fresh_(my_version).csv",
        "barn dancing isn't real": "barn_dancing_isn\u2019t_real.csv",
        "textbook panderin'": "textbook_panderin\u2019.csv",
        "Jack's Top Songs 2022": "Jack's_Top_Songs_2022.csv",
        "Jack's Top Songs 2023": "Jack's_Top_Songs_2023.csv",
        "Jack's Top Songs 2024": "Jack's_Top_Songs_2024.csv",
        "Jack's Top Songs 2025": "Jack's_Top_Songs_2025.csv"
    };
    if (overrides[playlistName] !== undefined) return overrides[playlistName];
    // Convert regular apostrophes to left single quotation marks to match filenames
    return playlistName.replaceAll(" ", "_").replaceAll("'", "'") + ".csv";
}

// CSV parser (handles quoted fields with commas)
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
    const nameIdx = headers.indexOf('Track Name');
    const albumIdx = headers.indexOf('Album Name');
    const artistIdx = headers.indexOf('Artist Name(s)');
    const durationIdx = headers.indexOf('Duration (ms)');
    const trackUriIdx = headers.indexOf('Track URI');
    const addedAtIdx = headers.indexOf('Added At');
    return lines.slice(1).map(line => {
        const fields = parseCSVLine(line);
        const trackUri = fields[trackUriIdx] || '';
        const trackId = trackUri.split(':')[2] || '';
        return {
            name: fields[nameIdx] || '',
            album: fields[albumIdx] || '',
            artist: fields[artistIdx] || '',
            duration: parseInt(fields[durationIdx]) || 0,
            trackId: trackId,
            addedAt: fields[addedAtIdx] || '',
            albumArt: trackId ? `https://i.scdn.co/image/${trackId}` : null
        };
    });
}

// Greeting
function getGreeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 21) return 'Good evening';
    return 'Good night';
}

// Initialize
function init() {
    // Sort playlists by date (newest to oldest)
    playlists.sort((a, b) => {
        // Handle null dates - put them at the end
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        // Sort by date descending (newest first)
        return new Date(b.date) - new Date(a.date);
    });

    document.getElementById('greeting').textContent = getGreeting();
    renderPlaylistGrid();
    renderSidebar();
    setupSearch();
    setupFilters();
    setupViewToggle();

    // Check for state to restore after a responsive reload
    const savedState = sessionStorage.getItem('jackify_reload_state');
    if (savedState) {
        sessionStorage.removeItem('jackify_reload_state');
        try {
            const state = JSON.parse(savedState);

            // Re-open the viewed playlist
            if (state.viewedPlaylistName) {
                const viewedPlaylist = playlists.find(p => p.name === state.viewedPlaylistName);
                if (viewedPlaylist) {
                    openPlaylist(viewedPlaylist);
                }
            }

            // Queue playback restore for when YouTube player is ready
            if (state.playingPlaylistName) {
                const playlistObj = playlists.find(p => p.name === state.playingPlaylistName);
                if (playlistObj) {
                    pendingRestore = {
                        playlist: playlistObj,
                        trackIndex: state.currentQueueIndex || 0,
                        seekTime: state.currentTime || 0
                    };
                }
            }
        } catch (e) {
            console.error('Error restoring state:', e);
        }
    }
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-chip, .mobile-filter-chip');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons (both desktop and mobile)
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update current filter
            currentFilter = btn.dataset.filter;
            // Re-render
            renderPlaylistGrid();
            renderSidebar();
        });
    });
}

// Setup view toggle button
function setupViewToggle() {
    const toggleBtn = document.getElementById('viewToggleBtn');
    const playlistGrid = document.getElementById('playlistGrid');
    const gridIcon = toggleBtn?.querySelector('.grid-icon');
    const listIcon = toggleBtn?.querySelector('.list-icon');

    if (!toggleBtn) return;

    let isGridView = false;

    toggleBtn.addEventListener('click', () => {
        isGridView = !isGridView;

        if (isGridView) {
            playlistGrid.classList.add('grid-view');
            gridIcon.style.display = 'none';
            listIcon.style.display = 'block';
        } else {
            playlistGrid.classList.remove('grid-view');
            gridIcon.style.display = 'block';
            listIcon.style.display = 'none';
        }
    });
}

// Render playlist grid
function renderPlaylistGrid() {
    const grid = document.getElementById('playlistGrid');
    grid.innerHTML = '';

    let filtered = playlists;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply category filter
    if (currentFilter === 'playlists') {
        filtered = filtered.filter(p => !p.category || p.category !== 'madeForYou');
    } else if (currentFilter === 'madeForYou') {
        filtered = filtered.filter(p => p.category === 'madeForYou');
    }

    filtered.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.onclick = () => openPlaylist(p);

        const imgHtml = p.img
            ? `<img class="card-img" src="${encodeImgPath(p.img)}" alt="${escHtml(p.name)}" onerror="handleImgError(this)">`
            : `<div class="card-img" style="background:#333;display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1;border-radius:6px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v12.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>
               </div>`;

        const author = p.author || 'Jack Dutton';
        const subtitleText = p.subtitle || `Playlist \u00B7 ${author}`;

        card.innerHTML = `
            <div class="card-img-wrapper">
                ${imgHtml}
                <button class="card-play-btn">
                    <svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>
                </button>
            </div>
            <div class="playlist-card-info">
                <div class="card-title" title="${escHtml(p.name)}">${escHtml(p.name)}</div>
                <div class="card-subtitle">${escHtml(subtitleText)}</div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Render sidebar
function renderSidebar() {
    const list = document.getElementById('sidebarList');
    list.innerHTML = '';

    let filtered = playlists;

    // Apply category filter
    if (currentFilter === 'playlists') {
        filtered = filtered.filter(p => !p.category || p.category !== 'madeForYou');
    } else if (currentFilter === 'madeForYou') {
        filtered = filtered.filter(p => p.category === 'madeForYou');
    }

    filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'library-item' + (currentPlaylist === p ? ' active' : '');
        item.onclick = () => openPlaylist(p);

        const imgHtml = `<img class="library-item-img" src="${p.img ? encodeImgPath(p.img) : ''}" alt="" onerror="handleImgError(this)">`;

        const author = p.author || 'Jack Dutton';
        item.innerHTML = `
            ${imgHtml}
            <div class="library-item-info">
                <div class="library-item-title">${escHtml(p.name)}</div>
                <div class="library-item-meta">Playlist \u00B7 ${author}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

// Open playlist detail
async function openPlaylist(p) {
    currentPlaylist = p;
    currentView = 'playlist';

    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('playlistView').classList.remove('hidden');
    document.getElementById('backBtn').disabled = false;

    // Hide mobile library header when viewing a playlist
    const mobileHeader = document.querySelector('.mobile-library-header');
    if (mobileHeader) mobileHeader.style.display = 'none';

    await renderPlaylistDetail(p);
    renderSidebar();

    document.getElementById('playlistView').scrollTop = 0;
}

// Go home
function goHome() {
    currentView = 'home';
    currentPlaylist = null;

    document.getElementById('homeView').classList.remove('hidden');
    document.getElementById('playlistView').classList.add('hidden');
    document.getElementById('backBtn').disabled = true;

    // Show mobile library header when returning home (only on mobile via CSS)
    const mobileHeader = document.querySelector('.mobile-library-header');
    if (mobileHeader) mobileHeader.style.display = '';

    renderSidebar();
}

// Render playlist detail
async function renderPlaylistDetail(p) {
    const header = document.getElementById('playlistHeader');
    const tracks = document.getElementById('playlistTracks');

    const titleClass = p.name.length > 30 ? 'very-long-title' : p.name.length > 18 ? 'long-title' : '';

    const imgHtml = p.img
        ? `<img class="playlist-detail-img" src="${encodeImgPath(p.img)}" alt="${escHtml(p.name)}" onerror="handleImgError(this)">`
        : `<div class="playlist-detail-img" style="background:#333;display:flex;align-items:center;justify-content:center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v12.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>
           </div>`;

    const descHtml = p.description
        ? `<div class="playlist-description">${escHtml(p.description)}</div>`
        : p.subtitle
            ? `<div class="playlist-description">${escHtml(p.subtitle)}</div>`
            : '';

    const author = p.author || 'Jack Dutton';
    header.innerHTML = `
        <div class="playlist-header-bg" style="background: linear-gradient(180deg, ${getHeaderColor(p)} 0%, var(--bg-elevated) 100%);"></div>
        ${imgHtml}
        <div class="playlist-detail-info">
            <div class="playlist-type">Playlist</div>
            <h1 class="playlist-detail-title ${titleClass}">${escHtml(p.name)}</h1>
            ${descHtml}
            <div class="playlist-meta">
                <span class="playlist-meta-owner">${author}</span>
                <span class="playlist-meta-dot">\u00B7</span>
                <span class="playlist-meta-detail">${p.songs} song${p.songs !== 1 ? 's' : ''}${p.date ? ', ' + formatDate(p.date) : ''}</span>
            </div>
        </div>
    `;

    // Controls + loading placeholder
    tracks.innerHTML = `
        <div class="playlist-controls">
            <button class="play-large-btn" id="playPlaylistBtn">
                <svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>
            </button>
            <a href="${p.url}" target="_blank" rel="noopener" class="open-spotify-btn" title="Open in Spotify">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.045 15.866a.686.686 0 0 1-.943.228c-2.584-1.578-5.834-1.935-9.663-1.06a.686.686 0 0 1-.306-1.337c4.19-.958 7.786-.546 10.684 1.226a.686.686 0 0 1 .228.943zm1.346-2.995a.858.858 0 0 1-1.18.282c-2.956-1.817-7.464-2.344-10.961-1.282a.858.858 0 0 1-.496-1.641c3.995-1.212 8.962-.625 12.357 1.462a.858.858 0 0 1 .28 1.179zm.116-3.119c-3.546-2.106-9.395-2.3-12.78-1.272a1.029 1.029 0 1 1-.597-1.969c3.886-1.18 10.345-.952 14.427 1.472a1.029 1.029 0 0 1-1.05 1.769z"/></svg>
            </a>
        </div>
        <div class="track-loading" style="padding:0 32px;color:var(--text-secondary);font-size:14px;">Loading tracks...</div>
    `;

    // Fetch and render tracks
    try {
        const csvFile = getCSVFilename(p.name);
        const resp = await fetch('csvs/' + encodeURIComponent(csvFile));
        if (!resp.ok) throw new Error('CSV not found');
        const text = await resp.text();
        const trackData = parseCSV(text);

        // Remove loading indicator
        const loading = tracks.querySelector('.track-loading');
        if (loading) loading.remove();

        // Hide date column for Spotify playlists
        if (p.author === 'Spotify') {
            tracks.classList.add('hide-date-column');
        } else {
            tracks.classList.remove('hide-date-column');
        }

        if (trackData.length === 0) {
            tracks.innerHTML += `
                <a class="open-spotify-link" href="${p.url}" target="_blank" rel="noopener">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.045 15.866a.686.686 0 0 1-.943.228c-2.584-1.578-5.834-1.935-9.663-1.06a.686.686 0 0 1-.306-1.337c4.19-.958 7.786-.546 10.684 1.226a.686.686 0 0 1 .228.943zm1.346-2.995a.858.858 0 0 1-1.18.282c-2.956-1.817-7.464-2.344-10.961-1.282a.858.858 0 0 1-.496-1.641c3.995-1.212 8.962-.625 12.357 1.462a.858.858 0 0 1 .28 1.179zm.116-3.119c-3.546-2.106-9.395-2.3-12.78-1.272a1.029 1.029 0 1 1-.597-1.969c3.886-1.18 10.345-.952 14.427 1.472a1.029 1.029 0 0 1-1.05 1.769z"/></svg>
                    Open in Spotify
                </a>
            `;
            return;
        }

        // Track list header
        const headerRow = document.createElement('div');
        headerRow.className = 'track-list-header';
        headerRow.innerHTML = `
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Date added</span>
            <span class="col-duration">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/></svg>
            </span>
        `;
        tracks.appendChild(headerRow);

        // Track rows
        let trackNumber = 1;
        trackData.forEach((track) => {
            // Skip tracks with empty names (deleted/unavailable tracks)
            if (!track.name || track.name.trim() === '') {
                return;
            }

            const row = document.createElement('div');
            row.className = 'track-row';
            // Use playlist date if track was added on Feb 16, 2025
            let trackAddedDate = track.addedAt ? track.addedAt.split('T')[0] : '';
            if (trackAddedDate === '2025-02-16' && p.date) {
                trackAddedDate = p.date;
            }
            const addedDate = trackAddedDate ? formatDate(trackAddedDate) : '';
            const formattedArtist = track.artist.replace(/;/g, ', ');
            row.innerHTML = `
                <span class="track-num">${trackNumber}</span>
                <div class="track-info">
                    <img class="track-img skeleton" src="" alt="" data-track-id="${track.trackId}">
                    <div class="track-name-artist">
                        <div class="track-name">${escHtml(track.name)}</div>
                        <div class="track-artist">${escHtml(formattedArtist)}</div>
                    </div>
                </div>
                <span class="track-album">${escHtml(track.album)}</span>
                <span class="track-added">${addedDate}</span>
                <span class="track-duration">${formatDuration(track.duration)}</span>
            `;
            tracks.appendChild(row);

            // Add click handler to play track
            row.addEventListener('click', () => {
                // Set up queue from current playlist if not already playing from it
                if (!playingPlaylist || playingPlaylist.name !== p.name) {
                    playingPlaylist = p;
                    const validTracks = trackData.filter(t => t.name && t.name.trim() !== '');
                    currentQueue = validTracks;
                    originalQueue = [...validTracks]; // Store original order
                    if (isShuffled) {
                        shuffleQueue();
                    }
                }
                // Find track index in queue
                const trackIndex = currentQueue.findIndex(t => t.name === track.name);
                if (trackIndex >= 0) {
                    playTrack(track, trackIndex);
                }
            });

            // Fetch album artwork
            if (track.trackId) {
                fetchAlbumArt(track.trackId, row.querySelector('.track-img'));
            }

            trackNumber++;
        });

        // Set up play playlist button
        const playBtn = document.getElementById('playPlaylistBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (trackData.length > 0) {
                    playPlaylist(p);
                }
            });
        }
    } catch (e) {
        // Fallback: show Open in Spotify link
        const loading = tracks.querySelector('.track-loading');
        if (loading) loading.remove();
        tracks.innerHTML += `
            <a class="open-spotify-link" href="${p.url}" target="_blank" rel="noopener">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.045 15.866a.686.686 0 0 1-.943.228c-2.584-1.578-5.834-1.935-9.663-1.06a.686.686 0 0 1-.306-1.337c4.19-.958 7.786-.546 10.684 1.226a.686.686 0 0 1 .228.943zm1.346-2.995a.858.858 0 0 1-1.18.282c-2.956-1.817-7.464-2.344-10.961-1.282a.858.858 0 0 1-.496-1.641c3.995-1.212 8.962-.625 12.357 1.462a.858.858 0 0 1 .28 1.179zm.116-3.119c-3.546-2.106-9.395-2.3-12.78-1.272a1.029 1.029 0 1 1-.597-1.969c3.886-1.18 10.345-.952 14.427 1.472a1.029 1.029 0 0 1-1.05 1.769z"/></svg>
                Open in Spotify
            </a>
        `;
    }
}

// Setup navigation
function setupSearch() {
    document.getElementById('backBtn').addEventListener('click', goHome);

    // Click Home to go home
    document.querySelectorAll('.sidebar-nav-item')[0].addEventListener('click', () => {
        searchTerm = '';
        goHome();
        renderPlaylistGrid();
    });
}

// Helpers
function handleImgError(el) {
    const wrapper = document.createElement('div');
    wrapper.className = el.className;
    wrapper.style.background = '#333';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.width = el.width ? el.width + 'px' : '';
    wrapper.style.aspectRatio = el.classList.contains('card-img') ? '1' : '';
    wrapper.style.borderRadius = el.classList.contains('card-img') ? '6px' : '4px';
    const size = el.classList.contains('playlist-detail-img') ? 64 : 48;
    wrapper.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v12.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`;
    el.replaceWith(wrapper);
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function encodeImgPath(path) {
    // Split at pfps/ and encode the filename part, then use blob URL if available
    if (!path) return '';
    const parts = path.split('/');
    const dir = parts.slice(0, -1).join('/');
    const file = parts[parts.length - 1];
    const encodedPath = dir + '/' + encodeURIComponent(file);
    return getImageUrl(encodedPath);
}

function getHeaderColor(p) {
    // Generate a deterministic color from playlist name
    let hash = 0;
    const name = p.name;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 40%, 25%)`;
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', init);

// ============================================
// YOUTUBE PLAYBACK INTEGRATION
// ============================================

const YOUTUBE_API_KEY = 'AIzaSyD0B2JvNBRFzCLW_A6DIKZvSS5JRJE-mEU';

// Player state
let ytPlayer = null;
let currentQueue = [];
let originalQueue = []; // Store original unshuffled order
let currentQueueIndex = -1;
let playingPlaylist = null; // Track which playlist is currently playing
let currentTrackElement = null; // Track the currently highlighted track row
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let currentVolume = 70;
let progressUpdateInterval = null;
let hasAPIError = false; // Track if YouTube API is unavailable
let videoMappings = {}; // Pre-generated video mappings
let pendingRestore = null; // State to restore after responsive reload
let pendingSeekTime = null; // Seek time to apply once playback starts

// YouTube IFrame API ready callback
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube IFrame API ready');
    initYouTubePlayer();
};

// Check if YouTube API is already loaded
function checkYouTubeAPI() {
    if (typeof YT !== 'undefined' && YT.Player) {
        console.log('YouTube API already loaded, initializing player');
        initYouTubePlayer();
    } else {
        console.log('Waiting for YouTube API to load...');
        // Set a timeout to retry initialization if the API doesn't load
        setTimeout(() => {
            if (!ytPlayer && typeof YT !== 'undefined' && YT.Player) {
                console.log('Retry: YouTube API loaded, initializing player');
                initYouTubePlayer();
            } else if (!ytPlayer) {
                console.error('YouTube API failed to load after timeout');
            }
        }, 3000);
    }
}

function initYouTubePlayer() {
    if (ytPlayer) {
        console.log('Player already initialized');
        return;
    }

    try {
        // Single player instance
        ytPlayer = new YT.Player('ytPlayer', {
            height: '100%',
            width: '100%',
            playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 0,
                playsinline: 1,
                disablekb: 1,
                iv_load_policy: 3
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }
        });
        console.log('YouTube player initialized successfully');
    } catch (error) {
        console.error('Error initializing YouTube player:', error);
    }
}

// Check on page load
document.addEventListener('DOMContentLoaded', () => {
    checkYouTubeAPI();
    initializeVideoPosition();
});

function onPlayerReady(event) {
    event.target.setVolume(currentVolume);
    updateVolumeDisplay();

    // Restore playback if we're coming back from a responsive reload
    if (pendingRestore) {
        const { playlist, trackIndex, seekTime } = pendingRestore;
        pendingRestore = null;
        restorePlayback(playlist, trackIndex, seekTime);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Apply pending seek from responsive reload
        if (pendingSeekTime !== null) {
            const seekTo = pendingSeekTime;
            pendingSeekTime = null;
            ytPlayer.seekTo(seekTo, true);
        }
        updatePlayPauseButton(true);
        startProgressUpdate();
    } else if (event.data === YT.PlayerState.PAUSED) {
        updatePlayPauseButton(false);
        stopProgressUpdate();
    } else if (event.data === YT.PlayerState.ENDED) {
        handleTrackEnd();
    }
}

function updatePlayPauseButton(isPlaying) {
    // Update compact button
    const icon = document.getElementById('playPauseIcon');
    const btn = document.getElementById('playPauseBtn');
    if (isPlaying) {
        // Pause icon
        icon.innerHTML = '<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>';
        btn.title = 'Pause';
    } else {
        // Play icon
        icon.innerHTML = '<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>';
        btn.title = 'Play';
    }

    // Update mobile button
    const mobileBtn = document.getElementById('mobilePlayBtn');
    if (mobileBtn) {
        const mobileSvg = mobileBtn.querySelector('svg');
        if (isPlaying) {
            mobileSvg.innerHTML = '<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>';
            mobileBtn.title = 'Pause';
        } else {
            mobileSvg.innerHTML = '<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>';
            mobileBtn.title = 'Play';
        }
    }

    // Update expanded button
    const expandedBtn = document.getElementById('expandedPlayPauseBtn');
    if (expandedBtn) {
        const expandedSvg = expandedBtn.querySelector('svg');
        if (isPlaying) {
            expandedSvg.innerHTML = '<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>';
        } else {
            expandedSvg.innerHTML = '<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>';
        }
    }
}

// Search YouTube for a track (with caching)
async function searchYouTube(trackName, artistName) {
    // Create mapping key (without yt_ prefix, matches generation script)
    const mappingKey = `${trackName.toLowerCase()}_${artistName.toLowerCase()}`.replace(/\s+/g, '_');

    // Create cache key for localStorage (with yt_ prefix for backwards compatibility)
    const cacheKey = `yt_${mappingKey}`;

    // Check pre-generated mappings first
    if (videoMappings[mappingKey]) {
        console.log('Using pre-mapped video ID for:', trackName);
        return videoMappings[mappingKey];
    }

    // Check localStorage cache second
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            console.log('Using cached video ID for:', trackName);
            return cached;
        }
    } catch (e) {
        console.warn('localStorage not available:', e);
    }

    // Not in mappings or cache, search YouTube
    const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);

        // Check for API quota/permission errors
        if (response.status === 403) {
            hasAPIError = true;
            console.error('YouTube API quota exceeded or access denied');
            return null;
        }

        if (!response.ok) {
            console.error('YouTube API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;

            // Save to cache
            try {
                localStorage.setItem(cacheKey, videoId);
                console.log('Cached video ID for:', trackName);
            } catch (e) {
                console.warn('Failed to cache video ID:', e);
            }

            return videoId;
        }
        return null;
    } catch (error) {
        console.error('YouTube search error:', error);
        return null;
    }
}

// Play a track
async function playTrack(track, queueIndex = -1) {
    if (!ytPlayer) {
        console.error('YouTube player not initialized');
        return;
    }

    // Update queue index if provided
    if (queueIndex >= 0) {
        currentQueueIndex = queueIndex;
    }

    // Search for video
    const videoId = await searchYouTube(track.name, track.artist);

    if (!videoId) {
        // If we have an API error, show error message and stop
        if (hasAPIError) {
            const info = document.getElementById('nowPlayingInfo');
            info.innerHTML = `
                <div class="now-playing-track">
                    <div class="now-playing-name">YouTube API unavailable</div>
                    <div class="now-playing-artist">Quota exceeded - try again tomorrow</div>
                </div>
            `;
            console.error('YouTube API quota exceeded. Cannot play tracks.');
            return;
        }

        // Otherwise, video not found - try next track (max 3 attempts)
        console.error('No video found for track:', track.name);
        if (currentQueue.length > 0 && currentQueueIndex < currentQueue.length - 1) {
            playNext();
        }
        return;
    }

    // Reset API error flag on successful search
    hasAPIError = false;

    // Load and play video
    ytPlayer.loadVideoById(videoId);

    // Explicitly play after a short delay to ensure it starts (especially on mobile)
    setTimeout(() => {
        if (ytPlayer && ytPlayer.playVideo) {
            ytPlayer.playVideo();
        }
    }, 100);

    // Update now playing info
    updateNowPlayingInfo(track);

    // Highlight current track in playlist
    updateTrackHighlight(track);
}

// Update track highlighting
function updateTrackHighlight(track) {
    // Remove previous highlighting
    if (currentTrackElement) {
        currentTrackElement.classList.remove('playing');
    }

    // Find and highlight current track if we're viewing the playing playlist
    if (playingPlaylist && currentPlaylist && playingPlaylist.name === currentPlaylist.name) {
        const trackRows = document.querySelectorAll('.track-row');
        trackRows.forEach(row => {
            const trackName = row.querySelector('.track-name');
            if (trackName && trackName.textContent === track.name) {
                row.classList.add('playing');
                currentTrackElement = row;
            }
        });
    }
}

// Update now playing display
function updateNowPlayingInfo(track) {
    // Hide placeholder, show video
    const placeholder = document.getElementById('nowPlayingPlaceholder');
    const video = document.getElementById('nowPlayingVideo');
    if (placeholder) placeholder.style.display = 'none';
    if (video) video.style.display = 'block';

    const info = document.getElementById('nowPlayingInfo');
    const formattedArtist = track.artist.replace(/;/g, ', ');
    info.innerHTML = `
        <div class="now-playing-track">
            <div class="now-playing-name">${escHtml(track.name)}</div>
            <div class="now-playing-artist">${escHtml(formattedArtist)}</div>
        </div>
    `;

    // Update album art (only shown on mobile via CSS)
    const albumArt = document.getElementById('nowPlayingAlbumArt');
    if (track.trackId) {
        const localPath = `album-art/${track.trackId}.jpg`;
        albumArt.src = localPath;
        albumArt.alt = track.album;
        // Remove inline display style to let CSS control visibility
        albumArt.style.display = '';
    }

    // Update now playing bar color
    const nowPlayingBar = document.querySelector('.now-playing-bar');
    const color = getNowPlayingColor(track);
    nowPlayingBar.style.background = color;

    // Update expanded view if it's showing
    if (isExpanded) {
        updateExpandedViewContent();
        const colors = getExpandedGradientColors(track);
        expandedView.style.background = `linear-gradient(180deg, ${colors.top} 0%, ${colors.bottom} 100%)`;
    }
}

// Generate saturated color for now playing bar
function getNowPlayingColor(track) {
    // Generate color from track name + album for variety
    let hash = 0;
    const seed = track.name + track.album;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Higher saturation (60-80%) and moderate lightness (15-25%) for vibrant, dark color
    const s = 60 + (Math.abs(hash >> 8) % 20);
    const l = 15 + (Math.abs(hash >> 16) % 10);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// Generate gradient colors for expanded view (two similar shades)
function getExpandedGradientColors(track) {
    let hash = 0;
    const seed = track.name + track.album;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const s = 60 + (Math.abs(hash >> 8) % 20);
    const l = 15 + (Math.abs(hash >> 16) % 10);

    // Two similar shades - top brighter, bottom slightly darker
    return {
        top: `hsl(${h}, ${s}%, ${l + 5}%)`,
        bottom: `hsl(${h}, ${s}%, ${l - 5}%)`
    };
}

// Play playlist
async function playPlaylist(playlist) {
    try {
        const csvFile = getCSVFilename(playlist.name);
        const resp = await fetch('csvs/' + encodeURIComponent(csvFile));
        if (!resp.ok) {
            console.error('Could not load playlist CSV');
            return;
        }
        const text = await resp.text();
        const allTracks = parseCSV(text);

        // Filter out empty tracks
        const tracks = allTracks.filter(t => t.name && t.name.trim() !== '');

        if (tracks.length === 0) {
            console.error('No tracks in playlist');
            return;
        }

        // Set the playing playlist
        playingPlaylist = playlist;
        currentQueue = tracks;
        originalQueue = [...tracks]; // Store original order
        currentQueueIndex = 0;

        if (isShuffled) {
            shuffleQueue();
        }

        playTrack(currentQueue[0], 0);
    } catch (e) {
        console.error('Error loading playlist:', e);
    }
}

// Restore playback after responsive reload
async function restorePlayback(playlist, trackIndex, seekTime) {
    try {
        const csvFile = getCSVFilename(playlist.name);
        const resp = await fetch('csvs/' + encodeURIComponent(csvFile));
        if (!resp.ok) return;
        const text = await resp.text();
        const allTracks = parseCSV(text);
        const tracks = allTracks.filter(t => t.name && t.name.trim() !== '');
        if (tracks.length === 0 || trackIndex >= tracks.length) return;

        playingPlaylist = playlist;
        currentQueue = tracks;
        originalQueue = [...tracks];
        currentQueueIndex = trackIndex;

        const track = currentQueue[trackIndex];
        const videoId = await searchYouTube(track.name, track.artist);
        if (!videoId) return;

        ytPlayer.loadVideoById(videoId);
        updateNowPlayingInfo(track);
        updateTrackHighlight(track);

        // Set pending seek — onPlayerStateChange will apply it once playback starts
        if (seekTime > 0) {
            pendingSeekTime = seekTime;
        }

        setTimeout(() => {
            if (ytPlayer && ytPlayer.playVideo) {
                ytPlayer.playVideo();
            }
        }, 100);
    } catch (e) {
        console.error('Error restoring playback:', e);
    }
}

// Player controls
function togglePlayPause() {
    if (!ytPlayer) return;

    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
}

function playNext() {
    if (currentQueue.length === 0) return;

    if (repeatMode === 'one') {
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
        return;
    }

    currentQueueIndex++;
    if (currentQueueIndex >= currentQueue.length) {
        if (repeatMode === 'all') {
            currentQueueIndex = 0;
        } else {
            // End of queue
            stopProgressUpdate();
            updatePlayPauseButton(false);
            return;
        }
    }

    playTrack(currentQueue[currentQueueIndex], currentQueueIndex);
}

function playPrevious() {
    if (currentQueue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (ytPlayer && ytPlayer.getCurrentTime() > 3) {
        ytPlayer.seekTo(0);
        return;
    }

    currentQueueIndex--;
    if (currentQueueIndex < 0) {
        if (repeatMode === 'all') {
            currentQueueIndex = currentQueue.length - 1;
        } else {
            currentQueueIndex = 0;
        }
    }

    playTrack(currentQueue[currentQueueIndex], currentQueueIndex);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    const btn = document.getElementById('shuffleBtn');

    if (isShuffled) {
        btn.style.color = 'var(--accent)';
        if (currentQueue.length > 0) {
            // Save original order if not already saved
            if (originalQueue.length === 0) {
                originalQueue = [...currentQueue];
            }
            shuffleQueue();
        }
    } else {
        btn.style.color = '';
        // Restore original order
        if (originalQueue.length > 0) {
            // Find current track in original queue
            const currentTrack = currentQueue[currentQueueIndex];
            currentQueue = [...originalQueue];
            // Update index to match the current track position in original order
            currentQueueIndex = currentQueue.findIndex(t => t.name === currentTrack.name && t.artist === currentTrack.artist);
            if (currentQueueIndex === -1) currentQueueIndex = 0;
        }
    }
}

function shuffleQueue() {
    // Create a shuffled order of the entire queue
    // If a track is currently playing, keep it at position 0
    const shuffled = [...currentQueue];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // If there's a current track playing, move it to the front
    if (currentQueueIndex >= 0 && currentQueueIndex < currentQueue.length) {
        const currentTrack = currentQueue[currentQueueIndex];
        const shuffledIndex = shuffled.findIndex(t => t.name === currentTrack.name && t.artist === currentTrack.artist);
        if (shuffledIndex > 0) {
            // Swap current track to position 0
            [shuffled[0], shuffled[shuffledIndex]] = [shuffled[shuffledIndex], shuffled[0]];
        }
        currentQueueIndex = 0;
    }

    currentQueue = shuffled;
}

function handleTrackEnd() {
    playNext();
}

// Progress bar
function startProgressUpdate() {
    stopProgressUpdate();
    progressUpdateInterval = setInterval(updateProgress, 100);
}

function stopProgressUpdate() {
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
        progressUpdateInterval = null;
    }
}

function updateProgress() {
    if (!ytPlayer || ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const current = ytPlayer.getCurrentTime();
    const total = ytPlayer.getDuration();

    if (total > 0) {
        const percent = (current / total) * 100;

        // Update compact progress bar
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressCurrent').textContent = formatDuration(current * 1000);
        document.getElementById('progressTotal').textContent = formatDuration(total * 1000);

        // Update expanded progress bar if expanded
        if (isExpanded) {
            const expandedFill = document.querySelector('.expanded-progress-fill');
            if (expandedFill) {
                expandedFill.style.width = percent + '%';
            }
            document.getElementById('expandedProgressCurrent').textContent = formatDuration(current * 1000);
            document.getElementById('expandedProgressTotal').textContent = formatDuration(total * 1000);
        }
    }
}

function seekTo(percent) {
    if (!ytPlayer) return;
    const total = ytPlayer.getDuration();
    if (total > 0) {
        ytPlayer.seekTo(total * percent);
    }
}

// Volume control
function setVolume(percent) {
    currentVolume = percent;
    if (ytPlayer) {
        ytPlayer.setVolume(currentVolume);
    }
    updateVolumeDisplay();
}

function toggleMute() {
    if (currentVolume > 0) {
        setVolume(0);
    } else {
        setVolume(70);
    }
}

function updateVolumeDisplay() {
    document.getElementById('volumeFill').style.width = currentVolume + '%';

    const icon = document.getElementById('volumeIcon');
    if (currentVolume === 0) {
        // Muted icon
        icon.innerHTML = '<path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/><path d="M8 2.75v10.5a.75.75 0 0 1-1.238.57L3.472 11H1.75A.75.75 0 0 1 1 10.25v-4.5A.75.75 0 0 1 1.75 5h1.722l3.29-2.82A.75.75 0 0 1 8 2.75zM6.5 4.508L4.35 6.26a.75.75 0 0 1-.488.183h-1.36v3.113h1.36a.75.75 0 0 1 .488.183l2.15 1.752V4.508z"/>';
    } else if (currentVolume < 50) {
        // Low volume icon
        icon.innerHTML = '<path d="M8 2.75v10.5a.75.75 0 0 1-1.238.57L3.472 11H1.75A.75.75 0 0 1 1 10.25v-4.5A.75.75 0 0 1 1.75 5h1.722l3.29-2.82A.75.75 0 0 1 8 2.75zM6.5 4.508L4.35 6.26a.75.75 0 0 1-.488.183h-1.36v3.113h1.36a.75.75 0 0 1 .488.183l2.15 1.752V4.508zM11.5 8a3.5 3.5 0 0 0-1.5-2.873v5.746A3.5 3.5 0 0 0 11.5 8z"/>';
    } else {
        // High volume icon
        icon.innerHTML = '<path d="M8 2.75v10.5a.75.75 0 0 1-1.238.57L3.472 11H1.75A.75.75 0 0 1 1 10.25v-4.5A.75.75 0 0 1 1.75 5h1.722l3.29-2.82A.75.75 0 0 1 8 2.75zM6.5 4.508L4.35 6.26a.75.75 0 0 1-.488.183h-1.36v3.113h1.36a.75.75 0 0 1 .488.183l2.15 1.752V4.508zM11.5 8a3.5 3.5 0 0 0-1.5-2.873v5.746A3.5 3.5 0 0 0 11.5 8zM13.5 8a5.5 5.5 0 0 0-2.381-4.534.75.75 0 1 0-.738 1.306A4 4 0 0 1 12 8a4 4 0 0 1-1.619 3.228.75.75 0 0 0 .738 1.306A5.5 5.5 0 0 0 13.5 8z"/>';
    }
}

// Wire up event listeners
document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('nextBtn').addEventListener('click', playNext);
document.getElementById('prevBtn').addEventListener('click', playPrevious);
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('volumeBtn').addEventListener('click', toggleMute);

// Mobile Spotify button
document.getElementById('mobileSpotifyBtn').addEventListener('click', () => {
    if (currentQueue.length > 0 && currentQueueIndex >= 0) {
        const track = currentQueue[currentQueueIndex];
        if (track && track.trackId) {
            window.open(`https://open.spotify.com/track/${track.trackId}`, '_blank');
        }
    }
});

// Mobile play button
document.getElementById('mobilePlayBtn').addEventListener('click', togglePlayPause);

// Progress bar click
document.getElementById('progressTrack').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent);
});

// Volume bar click
document.getElementById('volumeTrack').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setVolume(percent);
});

// ============================================
// EXPANDED NOW PLAYING VIEW
// ============================================

let isExpanded = false;
const expandedView = document.getElementById('nowPlayingExpanded');
const nowPlayingBar = document.querySelector('.now-playing-bar');
const nowPlayingVideoOriginal = document.getElementById('nowPlayingVideo');
const expandedVideoContainer = document.getElementById('expandedVideoContainer');

// Store original parent of video for restoring later
const nowPlayingLeft = document.querySelector('.now-playing-left');

// Toggle expanded view
function toggleExpandedView() {
    const isMobile = window.innerWidth <= 600;

    if (!isMobile) {
        // Don't expand on desktop
        return;
    }

    isExpanded = !isExpanded;

    if (isExpanded) {
        // On mobile, just show the expanded view (video already there)
        expandedView.classList.remove('hidden');

        // Update expanded view content
        updateExpandedViewContent();

        // Set background color to match now playing bar
        if (currentQueue.length > 0 && currentQueueIndex >= 0) {
            const track = currentQueue[currentQueueIndex];
            const colors = getExpandedGradientColors(track);
            expandedView.style.background = `linear-gradient(180deg, ${colors.top} 0%, ${colors.bottom} 100%)`;
        }
    } else {
        // Hide expanded view
        expandedView.classList.add('hidden');
    }
}

// Initialize video position based on screen size
function initializeVideoPosition() {
    const isMobile = window.innerWidth <= 600;

    if (isMobile) {
        // On mobile, keep video in expanded container
        if (nowPlayingVideoOriginal.parentElement !== expandedVideoContainer) {
            expandedVideoContainer.appendChild(nowPlayingVideoOriginal);
            nowPlayingVideoOriginal.classList.add('expanded-position');
        }
    } else {
        // On desktop, keep video in compact bar
        if (nowPlayingVideoOriginal.parentElement !== nowPlayingLeft) {
            nowPlayingLeft.insertBefore(nowPlayingVideoOriginal, nowPlayingLeft.firstChild.nextSibling);
            nowPlayingVideoOriginal.classList.remove('expanded-position');
        }
    }
}

// Handle responsive transitions — full reload on breakpoint change
let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    const wasMobile = lastWidth <= 600;
    const isMobile = currentWidth <= 600;

    if (wasMobile !== isMobile) {
        // Save current state before reloading
        const state = {};

        if (currentPlaylist) {
            state.viewedPlaylistName = currentPlaylist.name;
        }

        if (playingPlaylist && currentQueue.length > 0 && currentQueueIndex >= 0) {
            state.playingPlaylistName = playingPlaylist.name;
            state.currentQueueIndex = currentQueueIndex;
            state.currentTime = (ytPlayer && ytPlayer.getCurrentTime) ? ytPlayer.getCurrentTime() : 0;
        }

        sessionStorage.setItem('jackify_reload_state', JSON.stringify(state));
        location.reload();
        return;
    }

    lastWidth = currentWidth;
});

// Update expanded view content
function updateExpandedViewContent() {
    if (currentQueue.length === 0 || currentQueueIndex < 0) return;

    const track = currentQueue[currentQueueIndex];
    const formattedArtist = track.artist.replace(/;/g, ', ');

    // Update title (playlist name)
    document.getElementById('expandedTitle').textContent = playingPlaylist?.name || '';

    // Update track info
    document.querySelector('.expanded-track-name').textContent = track.name;
    document.querySelector('.expanded-track-artist').textContent = formattedArtist;

    // Update progress times
    if (ytPlayer && ytPlayer.getDuration) {
        const current = ytPlayer.getCurrentTime() || 0;
        const total = ytPlayer.getDuration() || 0;
        document.getElementById('expandedProgressCurrent').textContent = formatDuration(Math.floor(current));
        document.getElementById('expandedProgressTotal').textContent = formatDuration(Math.floor(total));
    }

    // Sync shuffle button state
    const expandedShuffleBtn = document.getElementById('expandedShuffleBtn');
    if (isShuffled) {
        expandedShuffleBtn.classList.add('active');
    } else {
        expandedShuffleBtn.classList.remove('active');
    }
}

// Click on now playing bar to expand (except play button)
nowPlayingBar.addEventListener('click', (e) => {
    // Don't expand on desktop (only on mobile)
    if (window.innerWidth > 600) {
        return;
    }

    // Don't expand if clicking on a button or control
    if (e.target.closest('button') || e.target.closest('.player-controls') || e.target.closest('.volume-control')) {
        return;
    }

    // Only expand if something is playing
    if (currentQueue.length > 0 && currentQueueIndex >= 0) {
        toggleExpandedView();
    }
});

// Back button to collapse
document.getElementById('expandedBackBtn').addEventListener('click', toggleExpandedView);

// Wire up expanded view controls
document.getElementById('expandedPlayPauseBtn').addEventListener('click', togglePlayPause);
document.getElementById('expandedNextBtn').addEventListener('click', playNext);
document.getElementById('expandedPrevBtn').addEventListener('click', playPrevious);
document.getElementById('expandedShuffleBtn').addEventListener('click', () => {
    toggleShuffle();
    updateExpandedViewContent();
});

// Expanded progress bar click
document.getElementById('expandedProgressTrack').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent);
});


// Modify the large play button to play the playlist
const setupPlaylistPlayButton = () => {
    const observer = new MutationObserver(() => {
        const playBtn = document.querySelector('.play-large-btn');
        if (playBtn && currentPlaylist) {
            playBtn.onclick = (e) => {
                e.preventDefault();
                playPlaylist(currentPlaylist);
            };
        }

        const cardPlayBtns = document.querySelectorAll('.card-play-btn');
        cardPlayBtns.forEach(btn => {
            const card = btn.closest('.playlist-card');
            if (card) {
                const playlistName = card.querySelector('.card-title')?.textContent;
                if (playlistName) {
                    const playlist = playlists.find(p => p.name === playlistName);
                    if (playlist) {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            playPlaylist(playlist);
                        };
                    }
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

setupPlaylistPlayButton();
