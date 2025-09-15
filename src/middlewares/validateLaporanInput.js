const Joi = require("joi");
const express = require('express');
const multer = require('multer');
const r2Client = require('./r2Config'); 
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const laporanSchema = Joi.object({
  nama: Joi.string().required(),
  keluhan: Joi.string().required(),
  deskripsi: Joi.string().required(),
  lokasi: Joi.string().required(),
  tanggal: Joi.string().optional(),
  vote: Joi.number().integer().optional().default(0),
  status: Joi.string().optional(),
  photo: Joi.string().uri().optional().allow(null, ""),
});

router.post('/laporan', upload.single('photo'), async (req, res) => {
    let photoUrl = null;
    let fileName = null;

    try {
        if (req.file) {
            fileName = `laporan-photos/${Date.now()}-${req.file.originalname}`;
            
            const params = {
                Bucket: 'sistemdesa',
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await r2Client.send(new PutObjectCommand(params));
            
            photoUrl = `https://4cdb39fc96619271522ab6d0b5cb7df6.r2.cloudflarestorage.com/sistemdesa/${fileName}`;
        }

        const laporanData = { ...req.body, photo: photoUrl };

        const { error } = laporanSchema.validate(laporanData);

        if (error) {
            if (fileName) {
                await r2Client.send(new DeleteObjectCommand({ 
                    Bucket: 'sistemdesa', 
                    Key: fileName 
                }));
            }
            return res.status(400).json({ message: error.details[0].message });
        }
        
        // At this point, the data is valid.
        // You can now save `laporanData` to your database.
        // await db.saveLaporan(laporanData);

        res.status(201).json({ 
            message: 'Laporan submitted successfully', 
            data: laporanData 
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