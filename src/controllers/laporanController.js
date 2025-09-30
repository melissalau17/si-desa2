const laporanService = require("../services/laporanService");
const { handleError } = require("../utils/errorHandler");
const moment = require("moment-timezone");
const R2Service = require("../services/r2Service");
const { sendLaporanNotification, sendLaporanStatusNotification } = require("../services/notificationService");
const emitDashboardUpdate = require("../utils/emitDashboardUpdate");

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
        const { keluhan, deskripsi, lokasi } = req.body;
        const photoFile = req.file;

        if (!keluhan || !deskripsi || !lokasi) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }
        if (!photoFile) {
            return res.status(400).json({ message: "Foto harus diunggah!" });
        }

        const userId = req.user.user_id;
        const photoUrl = await R2Service.uploadFile(photoFile.buffer, photoFile.mimetype);
        const tanggalFormatted = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

        const data = {
            keluhan,
            deskripsi,
            lokasi,
            tanggal: tanggalFormatted,
            vote: 0,
            status: "belum dikerjakan",
            user_id: userId,
            photo_url: photoUrl,
        };

        const newLaporan = await laporanService.createLaporan(data);
        await sendLaporanNotification(newLaporan);
        await emitDashboardUpdate(req.io);

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
        const { deskripsi, lokasi, keluhan, vote, status } = req.body;
        const oldLaporan = await laporanService.getLaporanById(req.params.id);
        if (!oldLaporan) {
            return res.status(404).json({ message: "Laporan tidak ditemukan!" });
        }

        let photoUrl = oldLaporan.photo_url; 

        if (req.file) {
            const newPhoto = req.file;
            photoUrl = await R2Service.uploadFile(newPhoto.buffer, newPhoto.mimetype);
        }

        const updatePayload = {
            ...(deskripsi !== undefined && { deskripsi }),
            ...(lokasi !== undefined && { lokasi }),
            ...(keluhan !== undefined && { keluhan }),
            ...(vote !== undefined && { vote: parseInt(vote, 10) }),
            ...(status !== undefined && { status }),
            ...(photoUrl !== undefined && { photo_url: photoUrl }), 
        };

        const updatedLaporan = await laporanService.updateLaporan(req.params.id, updatePayload);

        if (updatedLaporan.status !== oldLaporan.status) {
            req.io.emit("laporanStatusUpdated", updatedLaporan);
        }
        await emitDashboardUpdate(req.io);
        res.status(200).json({
            message: "Laporan berhasil diperbarui!",
            data: updatedLaporan,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.voteLaporan = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const laporan = await laporanService.getLaporanById(id);
  if (!laporan) return res.status(404).json({ message: 'Laporan not found' });

  if (laporan.voters?.includes(user_id)) {
    return res.status(400).json({ message: 'User already voted' });
  }

  const updated = await laporanService.updateLaporan(id, {
    vote: laporan.vote + 1,
    voters: [...(laporan.voters || []), user_id],
  });

  res.status(200).json(updated);
};

exports.deleteLaporan = async (req, res) => {
    try {
        const deleted = await laporanService.deleteLaporan(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Laporan tidak ditemukan!" });
        }
        await emitDashboardUpdate(req.io);
        res.status(200).json({ message: "Laporan berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};