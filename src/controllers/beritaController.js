const beritaService = require("../services/beritaService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");

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
        // Perbaikan: Ganti status code dari 201 menjadi 200
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

        const tanggal = moment().tz("Asia/Jakarta").toISOString();

        const photo = req.file ? req.file.buffer : undefined;

        if (!photo) {
            return res.status(400).json({ message: "Photo harus diisi!" });
        }

        const newBerita = await beritaService.createBerita({
            judul,
            kategori,
            tanggal,
            kontent,
            status,
            photo,
        });

        // Kirim notifikasi berita baru
        // Perbaikan: Notifikasi hanya berisi informasi non-sensitif
        req.io.emit("notification", {
            title: "Berita Baru Diterbitkan!",
            message: `Berita dengan judul "${judul}" telah diterbitkan.`,
            time: tanggal,
        });

        // Perbaikan: Ganti status code dari 200 menjadi 201
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
        const photo = req.file ? req.file.buffer : undefined;

        const updatePayload = {
            judul,
            kategori,
            tanggal,
            kontent,
            status,
            photo,
        };

        const updatedBerita = await beritaService.updateBerita(req.params.id, updatePayload);

        // Tambahkan notifikasi jika ada pembaruan
        // Bandingkan status lama dan baru untuk menentukan apakah perlu notifikasi
        if (oldBerita.status !== status || oldBerita.judul !== judul || oldBerita.kontent !== kontent) {
            req.io.emit("notification", {
                title: "Berita Diperbarui!",
                message: `Berita "${judul}" telah diperbarui.`,
                time: tanggal,
            });
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