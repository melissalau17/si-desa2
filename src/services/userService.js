const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/hash");
const { createError } = require("../utils/errorrHandler");
const { Buffer } = require("buffer");
const { comparePassword } = require("../utils/hashUtils");

const bcrypt = require("bcrypt");

exports.getAllUsers = () => userModel.findAll();

exports.getUserById = (id) => userModel.findById(id);

const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); 
  return buffer;
};

exports.findByNIK = async (NIK) => {
  return await userModel.findByNIK(NIK);
};

exports.createUser = async (data) => {
  const {
    nama,
    username,
    email,
    password,
    photo,
    NIK,
    agama,
    alamat,
    jenis_kel,
    no_hp,
    role,
  } = data;

  // Hash password
  const hashedPassword = await hashPassword(password);
  // Jika ada foto, simpan foto sebagai Buffer atau path
  let photoBuffer = null;
  if (photo) {
    photoBuffer = photo.file ? photo.file : photo; // Menyimpan foto sebagai Buffer
  }

  // Simpan user ke dalam database
  return userModel.create({
    nama,
    username,
    email,
    password: hashedPassword,
    photo: photoBuffer, // Simpan foto sebagai Buffer
    NIK,
    agama,
    alamat,
    jenis_kel,
    no_hp,
    role,
  });
};

exports.updateUser = async (id, data, base64Photo) => {
  const existingUser = await userModel.findById(id);
  if (!existingUser) return null;
  const updateData = {
    nama: data.nama,
    username: data.username,
    email: data.email,
    password: data.password,
    photo: data.photo ?? existingUser.photo,
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

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }

  return userModel.update(id, updateData);
};

exports.deleteUser = (id) => userModel.remove(id);

exports.loginUser = async (identifier, password, role) => {
  // Cari user berdasarkan username atau email
  const user = await userModel.findByUsernameOrEmail(identifier);
  if (!user) {
    throw new Error("Email atau username tidak ditemukan!");
  }

  // Validasi role
  if (user.role !== role) {
    throw new Error("Role tidak cocok!");
  }

  // Cek password
  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new Error("Password salah!");
  }

  return user;
};
