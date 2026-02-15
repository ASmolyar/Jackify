const { list } = require('@vercel/blob');
const fs = require('fs');

// Check for BLOB_READ_WRITE_TOKEN
if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN environment variable not set');
    process.exit(1);
}

async function main() {
    console.log('Fetching blob URLs...\n');

    // Get a sample blob to determine the base URL
    const pfpsBlobs = await list({ prefix: 'pfps/', limit: 1 });

    if (pfpsBlobs.blobs.length === 0) {
        console.error('No blobs found. Upload images first with: npm run upload-to-blob');
        process.exit(1);
    }

    // Extract base URL from first blob
    const sampleUrl = pfpsBlobs.blobs[0].url;
    const baseUrl = sampleUrl.substring(0, sampleUrl.lastIndexOf('/pfps/'));

    console.log('Blob base URL:', baseUrl);

    // Create config file
    const config = {
        BLOB_BASE_URL: baseUrl
    };

    fs.writeFileSync('blob-config.json', JSON.stringify(config, null, 2));
    console.log('\n✅ Created blob-config.json');
    console.log('Base URL:', baseUrl);
}

main().catch(console.error);
