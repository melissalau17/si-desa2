const userService = require("../services/userService");
const { handleError } = require("../utils/errorrHandler");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "Tidak ada data user tersedia",
        data: [],
      });
    }

    res.status(200).json({ data: users });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: `User dengan ID ${req.params.id} tidak ditemukan`,
      });
    }

    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Ambil file dari req.file jika ada
    const photo = req.file ? req.file.buffer : null;

    const newUser = await userService.createUser({
      nama,
      email,
      password,
      photo,
    });
    res.status(201).json(newUser);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const photo = req.file ? req.file.buffer.toString("base64") : null;

    const updatedUser = await userService.updateUser(
      req.params.id,
      nama,
      email,
      password,
      photo
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};
