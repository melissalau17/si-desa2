const express = require('express');
const multer = require('multer');
const r2Client = require('../r2Config'); 
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3'); 
const Joi = require("joi");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const userSchema = Joi.object({
  nama: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().optional().allow(null, ""),
  password: Joi.string().min(6).required(),
  NIK: Joi.string().required(),
  agama: Joi.string().required(),
  alamat: Joi.string().required(),
  no_hp: Joi.string().required(),
  jenis_kel: Joi.string().required(),
  role: Joi.string().required(),
  photo: Joi.string().uri().optional().allow(null, ""),
});

router.post('/user', upload.single('photo'), async (req, res) => {
  try {
    let photoUrl = null;
    let fileName = null;

    if (req.file) {
      const fileName = `user-photos/${Date.now()}-${req.file.originalname}`;
      
      const params = {
        Bucket: 'sistemdesa',
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await r2Client.send(new PutObjectCommand(params));
      photoUrl = `https://4cdb39fc96619271522ab6d0b5cb7df6.r2.cloudflarestorage.com/sistemdesa/${fileName}`;
    }

    const userData = { ...req.body, photo: photoUrl };
    const { error } = userSchema.validate(userData);

    if (error) {
      if (photoUrl) {
        await r2Client.send(new DeleteObjectCommand({ Bucket: 'sistemdesa', Key: fileName }));
        console.error("Validation failed, cleaning up uploaded file.");
      }
      return res.status(400).json({ message: error.details[0].message });
    }

    // Save the user data and photo URL to the database.
    // await db.saveUser(userData);

    res.status(201).json({ 
      message: 'User created successfully', 
      user: userData 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;