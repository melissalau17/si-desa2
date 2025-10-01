const userService = require("../services/userService");
const { handleError } = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const R2Service = require("../services/r2Service"); 
const NotificationService = require("../services/notificationService"); 
const { hashPassword } = require("../utils/hash");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_rahasia";

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadPhoto = upload.single("photo");

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

    const photoFile = req.file; 

    if (!nama || !username || !password || !NIK || !agama || !alamat || !jenis_kel || !no_hp || !role) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    if (!NIK.trim().startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password harus minimal 6 karakter!" });
    }

    const existingUser = await userService.findByNIK(NIK);
    if (existingUser) {
      return res.status(409).json({ message: "NIK sudah digunakan!" });
    }

    let photoUrl = null;
    if (photoFile) {
      photoUrl = await R2Service.uploadFile(photoFile.buffer, photoFile.mimetype);
    }

    const newUser = await userService.createUser({
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
      photo_url: photoUrl,
    });

    if (io) {
      NotificationService.sendUserRegistrationNotification(newUser, io);
      io.emit("dashboard_update", { message: "New user registered" });
    }

    return res.status(201).json({
      message: "User berhasil dibuat!",
      data: newUser,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
    try {
        const { nama, email, username, password, NIK, agama, alamat, jenis_kel, no_hp, role } = req.body;
        const photo_url = req.file;
        const userId = req.params.id;

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
            { user_id: user.user_id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
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