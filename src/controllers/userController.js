const userService = require("../services/userService");
const { handleError } = require("../utils/errorrHandler");

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

    // Panggil service untuk login
    const user = await userService.loginUser(username, password);

    res.status(200).json({
      message: "Login berhasil!",
      data: user, // kirim data user
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Something went wrong!",
    });
  }
};
