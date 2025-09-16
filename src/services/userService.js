const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/hashUtils");
const { createError } = require("../utils/errorHandler");
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { verifyPassword } = require("../utils/hash");

exports.getAllUsers = () => userModel.findAll();

exports.getUserById = (id) => userModel.findById(id);

exports.findByNIK = async (NIK) => {
    return await userModel.findByNIK(NIK);
};

exports.createUser = async (data) => {
    const {
        nama,
        username,
        email,
        password,
        photoUrl,
        NIK,
        agama,
        alamat,
        jenis_kel,
        no_hp,
        role,
    } = data;

    const hashedPassword = await hashPassword(password);

    return userModel.create({
        nama,
        username,
        email,
        password: hashedPassword,
        photo: photoUrl,
        NIK,
        agama,
        alamat,
        jenis_kel,
        no_hp,
        role,
    });
};

exports.updateUser = async (id, data, photoUrl) => {
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
    };

    if (data.password) {
        updateData.password = await hashPassword(data.password);
    }

    if (photoUrl) {
        if (existingUser.photo) {
            const oldPhotoKey = existingUser.photo.split('/').slice(4).join('/');
            await r2Client.send(new DeleteObjectCommand({
                Bucket: 'sistemdesa',
                Key: oldPhotoKey
            }));
        }
        updateData.photo = photoUrl;
    } else if (data.photo === null) {
        if (existingUser.photo) {
            const oldPhotoKey = existingUser.photo.split('/').slice(4).join('/');
            await r2Client.send(new DeleteObjectCommand({
                Bucket: 'sistemdesa',
                Key: oldPhotoKey
            }));
        }
        updateData.photo = null;
    } else {
        updateData.photo = existingUser.photo;
    }

    return userModel.update(id, updateData);
};

exports.deleteUser = async (id) => {
    const user = await userModel.findById(id);
    if (!user) return null;

    if (user.photo) {
        const photoKey = user.photo.split('/').slice(4).join('/');
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