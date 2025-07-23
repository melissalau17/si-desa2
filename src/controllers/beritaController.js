const beritaService = require("../services/beritaService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");
const { io } = require("../index");

exports.getAllBeritas = async (req, res) => {
    try {
        const beritas = await beritaService.getAllBeritas();
        if (!beritas || beritas.length === 0) {
            return res.status(200).json({
                message: "Tidak ada data berita tersedia!",
                data: [],
            });
        }

        res.status(201).json({
            message: "Laporan berhasil dimuat!",
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
        res.status(201).json({
            message: `berita dengan ID  ${req.params.id} berhasil dimuat!`,
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

        // Ambil waktu sekarang dalam zona Asia/Jakarta (WIB) dan formatkan dalam ISO 8601
        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss"); // Tanpa 'Z' untuk zona WIB

        const photo = req.file ? req.file.buffer : null;

        if (!photo) {
            return res.status(400).json({ message: "Photo harus diisi!" });
        }

        const newBerita = await beritaService.createBerita({
            judul,
            kategori,
            tanggal, // Waktu yang sudah dalam format ISO-8601 tanpa 'Z' (WIB)
            kontent,
            status,
            photo,
        });

        io.emit("notification", {
            title: "Berita Baru!",
            message: `Judul: ${judul}`,
            kategori,
            kontent,
            tanggal,
        });

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

        // Ambil waktu sekarang dalam zona Asia/Jakarta (WIB)
        const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss"); // Format waktu sesuai ISO-8601 tanpa 'Z'

        const photo = req.file ? req.file.buffer.toString("base64") : null;

        const updatedBerita = await beritaService.updateBerita(req.params.id, {
            judul,
            kategori,
            tanggal, // Gunakan tanggal yang sudah diubah sesuai waktu sekarang
            kontent,
            status,
            photo,
        });

        if (!updatedBerita) {
            return res.status(404).json({ message: "Berita tidak ditemukan!" });
        }

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

        res.status(200).json({ message: "Berita berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};
