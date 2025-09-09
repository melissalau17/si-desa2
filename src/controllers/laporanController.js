const laporanService = require("../services/laporanService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");
const { io } = require("../index"); // Pastikan ini sudah diimpor dengan benar

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
        // Perbaikan: Ubah status code dari 201 menjadi 200
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
        const { nama, keluhan, deskripsi, lokasi, vote, photo: photoBase64 } = req.body;

        if (!nama || !lokasi || !keluhan || !deskripsi) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }

        const status = "Belum Dikerjakan"; // Gunakan konsisten: "Belum Dikerjakan"
        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

        const data = {
            nama,
            keluhan,
            tanggal,
            lokasi,
            deskripsi,
            vote: vote || 0, // Inisialisasi vote jika tidak ada
            status,
            ...(photoBase64 && {
                photo: Buffer.from(photoBase64.split(',')[1], 'base64'),
            }),
        };

        const newLaporan = await laporanService.createLaporan(data);

        // Tambahkan notifikasi laporan baru
        io.emit("notification", {
            title: "Laporan Baru",
            body: `${nama} mengirim laporan: ${keluhan}`,
            time: tanggal,
        });

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

        // Ambil data laporan lama untuk membandingkan status
        const oldLaporan = await laporanService.getLaporanById(req.params.id);
        if (!oldLaporan) {
            return res.status(404).json({ message: "Laporan tidak ditemukan!" });
        }

        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

        // Perbaikan: Tangani foto dari req.file
        const photo = req.file ? req.file.buffer : null;

        const updatePayload = {
            nama,
            deskripsi,
            tanggal,
            lokasi,
            keluhan,
            vote,
            status,
            ...(photo && { photo: photo }), // Tambahkan foto jika ada
        };

        const updatedLaporan = await laporanService.updateLaporan(req.params.id, updatePayload);
        
        // Cek jika status berubah dan kirim notifikasi jika diperlukan
        if (updatedLaporan.status !== oldLaporan.status) {
            io.emit("notification", {
                title: "Pembaruan Laporan",
                body: `Status laporan "${updatedLaporan.keluhan}" telah diperbarui menjadi: ${updatedLaporan.status}`,
                time: tanggal,
            });
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