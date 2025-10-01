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
    const laporanId = parseInt(req.params.id);
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const oldLaporan = await laporanService.getLaporanById(laporanId);
    if (!oldLaporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan!" });
    }

    let photoUrl = oldLaporan.photo_url;
    if (req.file) {
      const newPhoto = req.file;
      photoUrl = await R2Service.uploadFile(newPhoto.buffer, newPhoto.mimetype);
    }

    // Check if this request is a vote
    const isVote = req.body.vote !== undefined;

    const updatePayload = {
      ...(req.body.deskripsi !== undefined && { deskripsi: req.body.deskripsi }),
      ...(req.body.lokasi !== undefined && { lokasi: req.body.lokasi }),
      ...(req.body.keluhan !== undefined && { keluhan: req.body.keluhan }),
      ...(photoUrl !== undefined && { photo_url: photoUrl }),
    };

    if (isVote) {
      // Prevent double voting
      if (oldLaporan.voters?.includes(userId)) {
        return res.status(400).json({ message: "Anda sudah memberikan vote" });
      }

      updatePayload.vote = (oldLaporan.vote || 0) + 1;
      updatePayload.voters = [...(oldLaporan.voters || []), userId].filter(Boolean);

      // Optional: auto-change status when vote reaches threshold
      if (updatePayload.vote >= 50 && oldLaporan.status !== "siap dikerjakan") {
        updatePayload.status = "siap dikerjakan";
      }
    } else if (req.body.status !== undefined) {
      updatePayload.status = req.body.status;
    }

    const updatedLaporan = await laporanService.updateLaporan(laporanId, updatePayload);

    // Emit updates if necessary
    if (updatedLaporan.status !== oldLaporan.status && req.io) {
      req.io.emit("laporanStatusUpdated", updatedLaporan);
    }
    if (req.io) await emitDashboardUpdate(req.io);

    res.status(200).json({
      message: isVote ? "Vote berhasil!" : "Laporan berhasil diperbarui!",
      data: updatedLaporan,
    });
  } catch (error) {
    console.error("Error updating laporan:", error);
    handleError(res, error);
  }
};

exports.voteLaporan = async (req, res) => {
  try {
    const laporanId = parseInt(req.params.id);
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const laporan = await laporanService.getLaporanById(laporanId);
    if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan!" });

    // Prevent double voting
    if (laporan.voters?.includes(userId)) {
      return res.status(400).json({ message: "Anda sudah memberikan vote" });
    }

    // Safely update voters array
    const updatedLaporan = await laporanService.updateLaporan(laporanId, {
      vote: (laporan.vote || 0) + 1,
      voters: [...(laporan.voters || []), userId].filter(Boolean),
    });

    res.status(200).json({ message: "Vote berhasil!", data: updatedLaporan });
  } catch (error) {
    console.error("Error updating laporan:", error);
    res.status(500).json({ message: "Gagal vote", error: error.message });
  }
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