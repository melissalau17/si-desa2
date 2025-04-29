const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/hash");
const { createError } = require("../utils/errorrHandler");
const { Buffer } = require("buffer");
const { comparePassword } = require("../utils/hashUtils");

exports.getAllUsers = () => userModel.findAll();

exports.getUserById = (id) => userModel.findById(id);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.createUser = async (data) => {
  const {
    nama,
    username,
    password,
    photo,
    NIK,
    agama,
    alamat,
    jenis_kel,
    no_hp,
  } = data;

  // Hash password
  const hashedPassword = await hashPassword(password);
  const NIKFirst = `120724${NIK}`;

  // Jika ada foto, simpan foto sebagai Buffer atau path
  let photoBuffer = null;
  if (photo) {
    photoBuffer = photo.file ? photo.file : photo; // Menyimpan foto sebagai Buffer
  }

  // Simpan user ke dalam database
  return userModel.create({
    nama,
    username,
    password: hashedPassword,
    photo: photoBuffer, // Simpan foto sebagai Buffer
    NIK: NIKFirst,
    agama,
    alamat,
    jenis_kel,
    no_hp,
  });
};

exports.updateUser = async (id, data, base64Photo) => {
  const updateData = {
    nama: data.nama,
    username: data.username,
    password: data.password,
    photo: data.photo,
    NIK: data.NIK,
    agama: data.agama,
    alamat: data.alamat,
    jenis_kel: data.jenis_kel,
    no_hp: data.no_hp,
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

exports.loginUser = async (username, password) => {
  const user = await userModel.findUsername(username);
  if (!user) {
    throw new Error("Username tidak ditemukan!");
  }

  // Periksa kecocokan password yang diinput dengan password yang di-hash di DB
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Password salah!");
  }

  return user;
};
