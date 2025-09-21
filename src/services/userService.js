const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/hash");
const { createError } = require("../utils/errorHandler");
const r2Client = require('../r2Config');
const R2Service = require("../services/r2Service"); 
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.getAllUsers = () => userModel.findAll();

exports.getUserById = (id) => userModel.findById(id);

exports.findByNIK = async (NIK) => {
    return await userModel.findByNIK(NIK);
};

exports.createUser = async (data, file) => {
    const {
        nama,
        username,
        email,
        password,
        NIK,
        agama,
        alamat,
        jenis_kel,
        no_hp,
        role,
    } = data;

    const hashedPassword = await hashPassword(password);

    let photoUrl = null;
    if (file) {
        // Upload ke R2
        photoUrl = await R2Service.uploadFile(file.buffer, file.mimetype);
    }

    return userModel.create({
        nama,
        username,
        email,
        password: hashedPassword,
        photo_url: photoUrl,
        NIK,
        agama,
        alamat,
        jenis_kel,
        no_hp,
        role,
    });
};

exports.updateUser = async (id, data, file) => {
    const existingUser = await userModel.findById(id);
    if (!existingUser) return null;

    const updateData = {
        nama: data.nama,
        username: data.username,
        email: data.email,
        NIK: data.NIK,
        agama: data.agama,
        alamat: data.alamat,
        jenis_kel: data.jenis_kel,
        no_hp: data.no_hp,
        role: data.role,
        photo_url: existingUser.photo_url,
    };

    if (data.password) {
        updateData.password = await hashPassword(data.password);
    }

    // Kalau ada file baru
    if (file) {
        // Hapus file lama
        if (existingUser.photo_url) {
            const oldKey = existingUser.photo_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
            await R2Service.deleteFile(oldKey);
        }
        // Upload file baru
        const newPhotoUrl = await R2Service.uploadFile(file.buffer, file.mimetype);
        updateData.photo_url = newPhotoUrl;
    } else if (data.photo_url === null) {
        // Hapus foto
        if (existingUser.photo_url) {
            const oldKey = existingUser.photo_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
            await R2Service.deleteFile(oldKey);
        }
        updateData.photo_url = null;
    }

    return userModel.update(id, updateData);
};

exports.deleteUser = async (id) => {
    const user = await userModel.findById(id);
    if (!user) return null;

    if (user.photo_url) {
        const photoKey = user.photo_url.split('/').slice(4).join('/'); 
        await r2Client.send(new DeleteObjectCommand({
            Bucket: 'sistemdesa',
            Key: photoKey
        }));
    }

    return userModel.remove(id);
};
exports.loginUser = async (identifier, password) => {
    const user = await userModel.findByUsernameOrEmail(identifier);
    if (!user) {
        throw createError("Email atau username tidak ditemukan!", 404);
    }
    
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
        throw createError("Password salah!", 401);
    }
    
    return user;
};