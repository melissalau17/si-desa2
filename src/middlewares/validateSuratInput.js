const express = require('express');
const multer = require('multer');
const r2Client = require('../r2Config');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Joi = require("joi");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const suratSchema = Joi.object({
    nik: Joi.string().required(),
    nama: Joi.string().required(),
    tempat_lahir: Joi.string().optional().allow(null, ""),
    tanggal_lahir: Joi.string()
        .optional()
        .allow(null, "")
        .custom((value, helpers) => {
            if (!value) return value;
            const regex = /^\d{2}-\d{2}-\d{4}$/;
            if (!regex.test(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }),
    no_hp: Joi.string().optional().allow(null, ""),
    email: Joi.string().optional().allow(null, ""),
    jenis_kelamin: Joi.string().optional().allow(null, ""),
    agama: Joi.string().optional().allow(null, ""),
    alamat: Joi.string().required(),
    tujuan_surat: Joi.string().required(),
    jenis_surat: Joi.string().required(),
    waktu_kematian: Joi.string().optional(),

    photo_ktp: Joi.string().uri().optional().allow(null, ""),
    photo_kk: Joi.string().uri().optional().allow(null, ""),
    foto_usaha: Joi.string().uri().optional().allow(null, ""),
    gaji_ortu: Joi.string().uri().optional().allow(null, ""),
});

const uploadFields = upload.fields([
    { name: 'photo_ktp', maxCount: 1 },
    { name: 'photo_kk', maxCount: 1 },
    { name: 'foto_usaha', maxCount: 1 },
    { name: 'gaji_ortu', maxCount: 1 },
]);

const uploadToR2 = async (file) => {
    if (!file) return null;
    const fileKey = `surat-photos/${Date.now()}-${file.originalname}`;
    const params = {
        Bucket: 'sistemdesa',
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    try {
        await r2Client.send(new PutObjectCommand(params));
        const fileUrl = `https://sistemdesa.4cdb39fc96619271522ab6d0b5cb7df6.r2.cloudflarestorage.com/${fileKey}`;
        return { url: fileUrl, key: fileKey };
    } catch (error) {
        console.error('Error uploading file to R2:', error);
        throw new Error('Failed to upload file to R2');
    }
};

const deleteFromR2 = async (key) => {
    if (!key) return;
    const params = {
        Bucket: 'sistemdesa',
        Key: key,
    };
    await r2Client.send(new DeleteObjectCommand(params));
};

router.post('/surat', uploadFields, async (req, res) => {
    const uploadedFiles = {};
    try {
        const uploadPromises = Object.keys(req.files).map(async (key) => {
            const file = req.files[key][0];
            const result = await uploadToR2(file);
            uploadedFiles[key] = result;
        });
        await Promise.all(uploadPromises);

        const suratData = { ...req.body };
        Object.keys(uploadedFiles).forEach(key => {
            suratData[key] = uploadedFiles[key].url;
        });

        const { error } = suratSchema.validate(suratData);

        if (error) {
            const deletePromises = Object.values(uploadedFiles).map(file => deleteFromR2(file.key));
            await Promise.all(deletePromises);
            console.error("Validation failed, cleaning up uploaded file.");
            return res.status(400).json({ message: error.details[0].message });
        }

        // At this point, all data is valid
        // Save `suratData` to your database
        // await db.saveSurat(suratData);

        res.status(201).json({ message: 'Surat data created successfully', data: suratData });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;