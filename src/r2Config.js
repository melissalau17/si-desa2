// r2Config.js
const { S3Client } = require('@aws-sdk/client-s3');

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`, 
  region: 'auto',
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

module.exports = s3Client;