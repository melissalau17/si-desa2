const beritaService = require("../services/beritaService");
const { handleError } = require("../utils/errorHandler");
const moment = require("moment-timezone");
const R2Service = require("../services/r2Service"); 
const NotificationService = require("../services/notificationService"); 

const sendBeritaNotification = async (berita) => {
    const { judul, status, tanggal } = berita;

    // Notify web users via Socket.IO
    req.io.emit("notification", {
        title: "Berita Terbaru!",
        message: `Berita dengan judul "${judul}" telah diterbitkan atau diperbarui.`,
        time: tanggal,
    });

    // Notify mobile users via FCM
    await NotificationService.sendPushNotificationToAdmins({
        title: "Berita Terbaru!",
        body: `Berita dengan judul "${judul}" telah diterbitkan atau diperbarui.`,
        data: {
            beritaId: berita.berita_id.toString(), // FCM data payload must be strings
        },
    });
};

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

        const tanggal = moment().tz("Asia/Jakarta").toISOString();
        const photo = req.file;

        if (!photo) {
            return res.status(400).json({ message: "Photo harus diisi!" });
        }

        // Upload the image to Cloudflare R2 and get the public URL
        const photoUrl = await R2Service.uploadFile(photo.buffer, photo.mimetype);

        const newBerita = await beritaService.createBerita({
            judul,
            kategori,
            tanggal,
            kontent,
            status,
            photo_url: photoUrl, // Use the URL instead of the buffer
        });

        // Trigger notifications for both web and mobile
        // Call the reusable function we defined above
        await sendBeritaNotification(newBerita);

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
        let photoUrl = oldBerita.photo_url; // Keep old URL by default

        // If a new file is uploaded, upload it to R2 and get the new URL
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
            photo_url: photoUrl, // Use the new or old URL
        };

        const updatedBerita = await beritaService.updateBerita(req.params.id, updatePayload);
        
        // Trigger notifications only if the status or content changed
        if (oldBerita.status !== status || oldBerita.judul !== judul || oldBerita.kontent !== kontent) {
            await sendBeritaNotification(updatedBerita);
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