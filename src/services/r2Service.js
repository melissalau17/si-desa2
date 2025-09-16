const s3Client = require('../r2Config');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// r2service.js
exports.uploadFile = async (fileBuffer, mimeType) => {
  const bucketName = process.env.R2_BUCKET_NAME;
  const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  try {
    await s3Client.send(command);
    
    return `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.dev/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
};

exports.deleteFile = async (fileName) => {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
};