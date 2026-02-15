const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Check for BLOB_READ_WRITE_TOKEN
if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN environment variable not set');
    console.error('Get your token from: https://vercel.com/dashboard/stores');
    console.error('Then run: export BLOB_READ_WRITE_TOKEN=your_token_here');
    process.exit(1);
}

async function uploadDirectory(dirPath, blobPrefix) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory ${dirPath} does not exist, skipping...`);
        return { uploaded: 0, skipped: 0, failed: 0 };
    }

    const files = fs.readdirSync(dirPath);
    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (!stat.isFile()) continue;

        const blobPath = `${blobPrefix}/${file}`;

        try {
            // Check if file already exists
            const existing = await list({ prefix: blobPath, limit: 1 });
            if (existing.blobs.length > 0) {
                console.log(`[SKIP] ${blobPath} (already exists)`);
                skipped++;
                continue;
            }

            // Upload file
            const fileContent = fs.readFileSync(filePath);
            const blob = await put(blobPath, fileContent, {
                access: 'public',
                addRandomSuffix: false
            });

            console.log(`[UPLOAD] ${blobPath} -> ${blob.url}`);
            uploaded++;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
            console.error(`[FAIL] ${blobPath}: ${error.message}`);
            failed++;
        }
    }

    return { uploaded, skipped, failed };
}

async function main() {
    console.log('Starting upload to Vercel Blob...\n');

    // Upload playlist covers
    console.log('=== Uploading Playlist Covers ===');
    const pfpsResults = await uploadDirectory('pfps', 'pfps');
    console.log(`Playlist covers: ${pfpsResults.uploaded} uploaded, ${pfpsResults.skipped} skipped, ${pfpsResults.failed} failed\n`);

    // Upload album art
    console.log('=== Uploading Album Art ===');
    const albumResults = await uploadDirectory('album-art', 'album-art');
    console.log(`Album art: ${albumResults.uploaded} uploaded, ${albumResults.skipped} skipped, ${albumResults.failed} failed\n`);

    // Summary
    const totalUploaded = pfpsResults.uploaded + albumResults.uploaded;
    const totalSkipped = pfpsResults.skipped + albumResults.skipped;
    const totalFailed = pfpsResults.failed + albumResults.failed;

    console.log('=== Summary ===');
    console.log(`Total uploaded: ${totalUploaded}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total failed: ${totalFailed}`);

    if (totalFailed > 0) {
        console.log('\n⚠️  Some uploads failed. Check errors above.');
        process.exit(1);
    } else {
        console.log('\n✅ All images uploaded successfully!');
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
