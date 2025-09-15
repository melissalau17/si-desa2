const express = require('express');
const multer = require('multer');
const r2Client = require('./r2Config'); 
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Joi = require("joi");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const beritaSchema = Joi.object({
  judul: Joi.string().required(),
  kategori: Joi.string().required(),
  tanggal: Joi.string().min(6).optional(),
  kontent: Joi.string().required(),
  status: Joi.string().required(),
  
  photo: Joi.string().uri().optional().allow(null, ""),
});

router.post('/berita', upload.single('photo'), async (req, res) => {
    let photoUrl = null;
    let fileName = null;

    try {
        if (req.file) {
            fileName = `berita-photos/${Date.now()}-${req.file.originalname}`;
            const params = {
                Bucket: 'sistemdesa',
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await r2Client.send(new PutObjectCommand(params));
            photoUrl = `https://4cdb39fc96619271522ab6d0b5cb7df6.r2.cloudflarestorage.com/sistemdesa/${fileName}`;
        }

        const beritaData = { ...req.body, photo: photoUrl };

        const { error } = beritaSchema.validate(beritaData);

        if (error) {
            if (fileName) {
                await r2Client.send(new DeleteObjectCommand({
                    Bucket: 'sistemdesa',
                    Key: fileName
                }));
                console.error("Validation failed, uploaded file cleaned up.");
            }
            return res.status(400).json({ message: error.details[0].message });
        }
        
        // At this point, the data is valid.
        // Save the news article data to your database.
        // await db.saveBerita(beritaData);

        res.status(201).json({ 
            message: 'Berita created successfully', 
            data: beritaData 
        });

    } catch (err) {
        if (fileName) {
            await r2Client.send(new DeleteObjectCommand({
                Bucket: 'sistemdesa',
                Key: fileName
            }));
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;