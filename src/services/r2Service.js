const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    }
});

exports.uploadFile = async (fileBuffer, mimeType) => {
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    const params = {
        Bucket: 'sistemdesa',
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
    };
    
    try {
        await r2Client.send(new PutObjectCommand(params));
        return fileName;
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw error;
    }
};

exports.deleteFile = async (fileName) => {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  try {
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
};