const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.uploadFile = async (fileBuffer, mimeType) => {
  const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await r2Client.send(new PutObjectCommand(params));

    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
};

exports.deleteFile = async (fileUrlOrKey) => {
  let key = fileUrlOrKey.startsWith('http') ? fileUrlOrKey.split('/').slice(-2).join('/') : fileUrlOrKey;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
};
