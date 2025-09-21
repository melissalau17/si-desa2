const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, 
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME; 
const PUBLIC_URL = process.env.R2_PUBLIC_URL; 

exports.uploadFile = async (fileBuffer, mimeType) => {
  const fileName = `uploads/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await r2Client.send(new PutObjectCommand(params));
    return `${PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
};

exports.deleteFile = async (fileUrlOrKey) => {
  let key = fileUrlOrKey;
  if (fileUrlOrKey.startsWith('http')) {
    key = fileUrlOrKey.replace(`${PUBLIC_URL}/`, '');
  }

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
