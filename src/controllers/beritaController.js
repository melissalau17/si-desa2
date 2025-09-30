const beritaService = require("../services/beritaService");
const { handleError } = require("../utils/errorHandler");
const moment = require("moment-timezone");
const R2Service = require("../services/r2Service"); 
const { sendBeritaNotification, sendUpdateBeritaNotification } = require("../services/notificationService");
const emitDashboardUpdate = require("../utils/emitDashboardUpdate");

exports.getAllBeritas = async (req, res) => {
    try {
        const beritas = await beritaService.getAllBeritas();
        if (!beritas || beritas.length === 0) {
            return res.status(200).json({
                message: "Tidak ada data berita tersedia!",
                data: [],
            });
        }
        res.status(200).json({
            message: "Berita berhasil dimuat!",
            data: beritas,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getBeritaById = async (req, res) => {
    try {
        const berita = await beritaService.getBeritaById(req.params.id);
        if (!berita) {
            return res.status(404).json({
                message: `Berita dengan ID ${req.params.id} tidak ditemukan!`,
            });
        }
        res.status(200).json({
            message: `Berita dengan ID ${req.params.id} berhasil dimuat!`,
            data: berita,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createBerita = async (req, res) => {
    try {
        const { judul, kategori, kontent, status } = req.body;
        if (!judul || !kategori || !kontent || !status) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }

        const user_id = req.user?.user_id; 
        if (!user_id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const tanggal = moment().tz("Asia/Jakarta").toISOString();
        const photoFile = req.file;

        if (!photoFile) {
            return res.status(400).json({ message: "Photo harus diisi!" });
        }

        const photoUrl = await R2Service.uploadFile(photoFile.buffer, photoFile.mimetype);

        const newBerita = await beritaService.createBerita({
            judul,
            kategori,
            tanggal,
            kontent,
            status,
            photo_url: photoUrl,
            createdBy: parseInt(user_id),
        });

        await sendBeritaNotification(newBerita);

        await emitDashboardUpdate(req.io);

        res.status(201).json({
            message: "Berita berhasil dibuat!",
            data: newBerita,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateBerita = async (req, res) => {
    try {
        const { judul, kategori, kontent, status } = req.body;
        const oldBerita = await beritaService.getBeritaById(req.params.id);
        if (!oldBerita) {
            return res.status(404).json({ message: "Berita tidak ditemukan!" });
        }

        const tanggal = moment().tz("Asia/Jakarta").toISOString();
        let photoUrl = oldBerita.photo_url; 

        if (req.file) {
            const newPhoto = req.file;
            photoUrl = await R2Service.uploadFile(newPhoto.buffer, newPhoto.mimetype);
        }

        const updatePayload = {
            judul,
            kategori,
            tanggal,
            kontent,
            status,
            photo_url: photoUrl,
        };

        const updatedBerita = await beritaService.updateBerita(req.params.id, updatePayload);
        
        if (oldBerita.status !== status || oldBerita.judul !== judul || oldBerita.kontent !== kontent) {
            await sendUpdateBeritaNotification(updatedBerita);
        }
        await emitDashboardUpdate(req.io);
        res.status(200).json({
            message: "Berita berhasil diperbarui!",
            data: updatedBerita,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBerita = async (req, res) => {
    try {
        const deleted = await beritaService.deleteBerita(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Berita tidak ditemukan!" });
        }
        await emitDashboardUpdate(req.io);
        res.status(200).json({ message: "Berita berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};