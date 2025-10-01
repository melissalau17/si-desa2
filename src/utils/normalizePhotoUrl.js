const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2Client, BUCKET_NAME } = require('../r2Config');

async function normalizePhotoUrl(photoUrl) {
    if (!photoUrl) return null;

    if (photoUrl.startsWith("http")) return photoUrl;

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photoUrl,
    });

    try {
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        return signedUrl;
    } catch (err) {
        console.error("Error generating signed URL:", err);
        return null;
    }
}

module.exports = normalizePhotoUrl;
