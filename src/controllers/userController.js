const userService = require("../services/userService");
const { handleError } = require("../utils/errorrHandler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { Buffer } = require("buffer");
const { verifyPassword, hashPassword } = require("../utils/hash");
const { io } = require("../index"); // Pastikan ini diimpor dengan benar

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

        // Perbaiki status code dari 201 menjadi 200
        res.status(200).json({
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
        // Perbaiki status code dari 201 menjadi 200
        res.status(200).json({
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
            email,
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
            email,
            password,
            photo,
            NIK,
            agama,
            alamat,
            jenis_kel,
            no_hp,
            role,
        });

        // Tambahkan notifikasi
        io.emit("notification", {
            title: "Pengguna Baru!",
            message: `User ${nama} berhasil ditambahkan sebagai ${role}.`,
            time: new Date(),
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
            email,
            username,
            password,
            NIK,
            agama,
            alamat,
            jenis_kel,
            no_hp,
            role,
        } = req.body;

        if (NIK && !NIK.startsWith("120724")) {
            return res.status(403).json({ message: "Anda bukan warga desa ini!" });
        }

        if (NIK) {
            const existingUser = await userService.findByNIK(NIK);
            if (existingUser && existingUser.user_id != req.params.id) {
                return res
                    .status(409)
                    .json({ message: "NIK sudah digunakan oleh user lain!" });
            }
        }

        let hashedPassword = undefined;
        // Perbaikan: Hashing password setiap kali ada perubahan
        if (password && !password.startsWith("$2b$")) {
            hashedPassword = await hashPassword(password);
        } else {
            hashedPassword = password;
        }

        const photo = req.file ? req.file.buffer.toString("base64") : null;

        const updatedUser = await userService.updateUser(req.params.id, {
            nama,
            username,
            email,
            password: hashedPassword,
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

exports.loginUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = await userModel.findUserByUsernameOrEmailAndRole(username, role);
        if (!user) {
            return res.status(404).json({ message: "Username atau role tidak cocok!" });
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah!" });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login berhasil!",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                nama: user.nama,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat login." });
    }
};