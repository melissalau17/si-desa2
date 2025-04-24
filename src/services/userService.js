const userModel = require("../models/userModel");
const { hashPassword } = require("../utils/hash");
const { createError } = require("../utils/errorrHandler");
const { Buffer } = require("buffer");

exports.getAllUsers = () => userModel.findAll();

exports.getUserById = (id) => userModel.findById(id);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.createUser = async (data) => {
  const { nama, email, password, photo } = data;

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
    email,
    password: hashedPassword,
    photo: photoBuffer, // Simpan foto sebagai Buffer
  });
};

exports.updateUser = async (id, data, base64Photo) => {
  const updateData = { nama: data.nama, email: data.email };

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }

  return userModel.update(id, updateData);
};

exports.deleteUser = (id) => userModel.remove(id);
