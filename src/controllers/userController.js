const userService = require("../services/userService");
const { handleError } = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const R2Service = require("../services/r2Service"); 
const NotificationService = require("../services/notificationService"); // Your Notification service
const { hashPassword } = require("../utils/hash");

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
        // The photo field should now be a URL string
        res.status(200).json({
            message: `User dengan ID ${req.params.id} berhasil dimuat!`,
            data: user,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { nama, username, email, password, NIK, agama, alamat, jenis_kel, no_hp, role } = req.body;
        const photo_url = req.file;
        const socket = req.app.get('socketio');

        if (!nama || !username || !password || !NIK || !agama || !alamat || !jenis_kel || !no_hp || !role) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }
        if (!NIK.startsWith("120724")) {
            return res.status(403).json({ message: "Anda bukan warga desa ini!" });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password harus minimal 6 karakter!" });
        }

        const existingUser = await userService.findByNIK(NIK);
        if (existingUser) {
            return res.status(409).json({ message: "NIK sudah digunakan!" });
        }

        console.log("Received photo object:", req.file);

        let photoUrl = null;
        if (req.file) {
            console.log("Attempting to upload file to R2...");
            photoUrl = await R2Service.uploadFile(req.file.buffer, req.file.mimetype);
            console.log("File uploaded successfully. URL:", photoUrl);
        }

        const newUser = await userService.createUser({
            nama, username, email, password, NIK, agama, alamat, jenis_kel, no_hp, role,
            photo_url: photoUrl,
        });

        await NotificationService.sendUserRegistrationNotification(newUser, socket);

        return res.status(201).json({
            message: "User berhasil dibuat!",
            data: newUser,
        });
    } catch (error) {
        console.error("Internal Server Error in createUser:", error);
        handleError(res, error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { nama, email, username, password, NIK, agama, alamat, jenis_kel, no_hp, role } = req.body;
        const photo_url = req.file;
        const userId = req.params.id;

        // Fetch the existing user to get their current photo_url
        const existingUser = await userService.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }
        
        if (NIK && !NIK.startsWith("120724")) {
            return res.status(403).json({ message: "Anda bukan warga desa ini!" });
        }

        if (NIK) {
            const userWithSameNIK = await userService.findByNIK(NIK);
            if (userWithSameNIK && userWithSameNIK.user_id != userId) {
                return res.status(409).json({ message: "NIK sudah digunakan oleh user lain!" });
            }
        }
        
        let hashedPassword = password ? await hashPassword(password) : undefined;
        let photoUrl = existingUser.photo_url;

        if (photo_url) {
            photoUrl = await R2Service.uploadFile(photo_url.buffer, photo_url.mimetype);
        }

        const updatePayload = {
            nama, username, email, NIK, agama, alamat, jenis_kel, no_hp, role,
            ...(hashedPassword && { password: hashedPassword }),
            photo_url: photoUrl,
        };

        const updatedUser = await userService.updateUser(userId, updatePayload);

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
        const user = await userService.loginUser(username, password);

        const token = jwt.sign(
            { user_id: user.user_id },
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
            },
        });
    } catch (error) {
        handleError(res, error); 
    }
};