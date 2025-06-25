const userService = require("../services/userService");
const { handleError } = require("../utils/errorrHandler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { Buffer } = require("buffer");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_rahasia";

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "Tidak ada data user tersedia!",
        data: [],
      });
    }

    res.status(201).json({
      message: "User berhasil dimuat!",
      data: users,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: `User dengan ID ${req.params.id} tidak ditemukan!`,
      });
    }
    res.status(201).json({
      message: `User dengan ID  ${req.params.id} berhasil dimuat!`,
      data: user,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      nama,
      username,
      password,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
      role,
    } = req.body;

    console.log("Request Body:", req.body);
    if (
      !nama ||
      !username ||
      !password ||
      !NIK ||
      !agama ||
      !alamat ||
      !jenis_kel ||
      !no_hp ||
      !role
    ) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    if (!NIK.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password harus minimal 6 karakter!" });
    }

    const existingUser = await userService.findByNIK(NIK);
    if (existingUser) {
      return res.status(409).json({ message: "NIK sudah digunakan!" });
    }

    const photoBase64 = req.body.photo;
    const photo = photoBase64
      ? Buffer.from(photoBase64.split(",")[1], "base64")
      : null;

    const newUser = await userService.createUser({
      nama,
      username,
      password,
      photo,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
      role,
    });

    return res.status(201).json({
      message: "User berhasil dibuat!",
      data: newUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const {
      nama,
      username,
      password,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
      role,
    } = req.body;

    // Validasi NIK jika ada perubahan
    if (NIK && !NIK.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    // Cek apakah NIK sudah digunakan oleh user lain
    if (NIK) {
      const existingUser = await userService.findByNIK(NIK);
      if (existingUser && existingUser.user_id != req.params.id) {
        return res
          .status(409)
          .json({ message: "NIK sudah digunakan oleh user lain!" });
      }
    }

    const photo = req.file ? req.file.buffer.toString("base64") : null;

    const updatedUser = await userService.updateUser(req.params.id, {
      nama,
      username,
      password,
      photo,
      NIK,
      agama,
      alamat,
      jenis_kel,
      no_hp,
      role,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    res.status(200).json({
      message: "User berhasil diperbarui!",
      data: updatedUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    res.status(200).json({ message: "User berhasil dihapus!" });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error getAllUsers:", error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

exports.getUserById = (id) => userModel.findById(id);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.findByNIK = async (NIK) => {
  return await userModel.findByNIK(NIK);
};

exports.loginUser = async (req, res) => {
  const method = req.method;

  if (method === "POST") {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username dan password wajib diisi!" });
      }

      const user = await userService.loginUser(username, password); // ini ke service

      const payload = { id: user.id, username: user.username, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      return res.status(200).json({
        message: "Login berhasil!",
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      return res
        .status(400)
        .json({ message: error.message || "Terjadi kesalahan saat login!" });
    }
  }

  if (method === "GET") {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json(decoded); // bisa juga ambil user detail dari DB
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau kadaluarsa" });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan" });
};
