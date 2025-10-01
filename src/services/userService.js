const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/hash");
const { createError } = require("../utils/errorHandler");
const r2Client = require('../r2Config');
const R2Service = require("../services/r2Service");
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const prisma = require("../prisma/prismaClient");

function normalizePhotoUrl(photoUrl) {
    if (!photoUrl) return null;
    return photoUrl.startsWith("http") ? photoUrl : `${PUBLIC_URL}/${photoUrl}`;
}

exports.countAll = async () => {
  const totalUsers = await prisma.user.count();
  return totalUsers;
};

exports.countNewThisMonth = () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.user.count({
    where: { createdAt: { gte: startOfMonth } },
  });
};

exports.getAllUsers = async () => {
    const users = await userModel.findAll();
    return users.map(u => ({ ...u, photo_url: normalizePhotoUrl(u.photo_url) }));
};

exports.getUserById = async (id) => {
    const user = await userModel.findById(id);
    if (!user) return null;
    return { ...user, photo_url: normalizePhotoUrl(user.photo_url) };
};

exports.findByNIK = async (NIK) => {
    const user = await userModel.findByNIK(NIK);
    if (!user) return null;
    return { ...user, photo_url: normalizePhotoUrl(user.photo_url) };
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

    if (file) {
        if (existingUser.photo_url) {
            const oldKey = existingUser.photo_url.replace(`${PUBLIC_URL}/`, "");
            await R2Service.deleteFile(oldKey);
        }
        const newPhotoUrl = await R2Service.uploadFile(file.buffer, file.mimetype);
        updateData.photo_url = newPhotoUrl;
    } else if (data.photo_url === null) {
        if (existingUser.photo_url) {
            const oldKey = existingUser.photo_url.replace(`${PUBLIC_URL}/`, "");
            await R2Service.deleteFile(oldKey);
        }
        updateData.photo_url = null;
    }

    const updatedUser = await userModel.update(id, updateData);
    return { ...updatedUser, photo_url: normalizePhotoUrl(updatedUser.photo_url) };
};

exports.deleteUser = async (id) => {
    const user = await userModel.findById(id);
    if (!user) return null;

    if (user.photo_url) {
        const photoKey = user.photo_url.replace(`${PUBLIC_URL}/`, "");
        await r2Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: photoKey,
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

    return { ...user, photo_url: normalizePhotoUrl(user.photo_url) };
};