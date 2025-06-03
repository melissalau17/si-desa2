const userService = require("../services/userService");
const { handleError } = require("../utils/errorrHandler");
const jwt = require("jsonwebtoken");

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
    const { nama, username, password, NIK, agama, alamat, jenis_kel, no_hp } =
      req.body;

    // Validasi inputan wajib
    if (
      !nama ||
      !username ||
      !password ||
      !NIK ||
      !agama ||
      !alamat ||
      !jenis_kel ||
      !no_hp
    ) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    // Validasi NIK harus diawali dengan 120724
    if (!NIK.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    // Cek apakah NIK sudah digunakan
    const existingUser = await userService.findByNIK(NIK);
    if (existingUser) {
      return res.status(409).json({ message: "NIK sudah digunakan!" });
    }

    const photo = req.file ? req.file.buffer : null;

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
    });

    res.status(201).json({
      message: "User berhasil dibuat!",
      data: newUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nama, username, password, NIK, agama, alamat, jenis_kel, no_hp } =
      req.body;

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

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi!" });
    }

    const user = await userService.loginUser(username, password);

    // Payload yang ingin kita masukkan ke JWT, bisa user ID atau username
    const payload = { id: user.id, username: user.username };

    // Generate token, contoh valid 1 jam
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Terjadi kesalahan saat login!" });
  }
};
