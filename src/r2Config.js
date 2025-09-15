const { S3Client } = require("@aws-sdk/client-s3");
const AWS = require('aws-sdk');


const accountId = process.env.CLOUDFLARE_ACCOUNT_ID; 
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  endpoint: endpoint,
  region: 'auto', 
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

module.exports = s3Client;