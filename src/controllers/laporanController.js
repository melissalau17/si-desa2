const laporanService = require("../services/laporanService");
const { handleError } = require("../utils/errorHandler");
const moment = require("moment-timezone");
const R2Service = require("../services/r2Service"); 
const NotificationService = require("../services/notificationService");

exports.getAllLaporans = async (req, res) => {
    try {
        const laporans = await laporanService.getAllLaporans();
        if (!laporans || laporans.length === 0) {
            return res.status(200).json({
                message: "Tidak ada data laporan tersedia!",
                data: [],
            });
        }
        res.status(200).json({
            message: "Laporan berhasil dimuat!",
            data: laporans,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getLaporanById = async (req, res) => {
    try {
        const laporan = await laporanService.getLaporanById(req.params.id);

        if (!laporan) {
            return res.status(404).json({
                message: `Laporan dengan ID ${req.params.id} tidak ditemukan!`,
            });
        }
        res.status(200).json({
            message: `Laporan dengan ID ${req.params.id} berhasil dimuat!`,
            data: laporan,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createLaporan = async (req, res) => {
    try {
        const { nama, keluhan, deskripsi, lokasi, vote, user_id } = req.body;
        const photo = req.file;

        if (!nama || !lokasi || !keluhan || !deskripsi) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }
        if (!user_id) {
            return res.status(400).json({ message: "User ID harus diisi!" });
        }
        if (!photo) {
            return res.status(400).json({ message: "Foto harus diunggah!" });
        }

        const status = "Belum Dikerjakan";
        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

        const photoUrl = await R2Service.uploadFile(photo.buffer, photo.mimetype);

        const data = {
            nama,
            keluhan,
            tanggal,
            lokasi,
            deskripsi,
            vote: vote || 0,
            status,
            user_id: parseInt(user_id, 10),
            photo: photoUrl,
        };

        const newLaporan = await laporanService.createLaporan(data);

        await NotificationService.sendLaporanNotification(newLaporan);

        res.status(201).json({
            message: "Laporan berhasil dibuat!",
            data: newLaporan,
        });
    } catch (error) {
        handleError(res, error);
    }
};


exports.updateLaporan = async (req, res) => {
    try {
        const { nama, deskripsi, lokasi, keluhan, vote, status } = req.body;
        const oldLaporan = await laporanService.getLaporanById(req.params.id);
        if (!oldLaporan) {
            return res.status(404).json({ message: "Laporan tidak ditemukan!" });
        }

        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");
        let photoUrl = oldLaporan.photo; 

        if (req.file) {
            const newPhoto = req.file;
            photoUrl = await R2Service.uploadFile(newPhoto.buffer, newPhoto.mimetype);
        }

        const updatePayload = {
            nama,
            deskripsi,
            tanggal,
            lokasi,
            keluhan,
            vote: parseInt(vote, 10) || oldLaporan.vote,
            status,
            photo: photoUrl,
        };

        const updatedLaporan = await laporanService.updateLaporan(req.params.id, updatePayload);
        
        if (updatedLaporan.status !== oldLaporan.status) {
            await NotificationService.sendLaporanStatusNotification(updatedLaporan);
        }

        res.status(200).json({
            message: "Laporan berhasil diperbarui!",
            data: updatedLaporan,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteLaporan = async (req, res) => {
    try {
        const deleted = await laporanService.deleteLaporan(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Laporan tidak ditemukan!" });
        }

        res.status(200).json({ message: "Laporan berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};