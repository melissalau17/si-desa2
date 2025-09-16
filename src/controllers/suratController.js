const suratService = require("../services/suratService");
const { handleError } = require("../utils/errorHandler");
const R2Service = require("../services/r2Service");
const NotificationService = require("../services/notificationService"); 
const moment = require("moment-timezone");

exports.getAllSurat = async (req, res) => {
    try {
        const surat = await suratService.getAllSurat();
        if (!surat || surat.length === 0) {
            return res.status(200).json({
                message: "Tidak ada data surat tersedia!",
                data: [],
            });
        }
        res.status(200).json({
            message: "Data surat berhasil dimuat!",
            data: surat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getSuratById = async (req, res) => {
    try {
        const surat = await suratService.getSuratById(req.params.id);
        if (!surat) {
            return res.status(404).json({
                message: `Surat dengan ID ${req.params.id} tidak ditemukan!`,
            });
        }
        res.status(200).json({
            message: `Surat dengan ID ${req.params.id} berhasil dimuat!`,
            data: surat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createSurat = async (req, res) => {
    try {
        const { nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian } = req.body;

        const photo_ktp = req.files?.photo_ktp?.[0];
        const photo_kk = req.files?.photo_kk?.[0];
        const foto_usaha = req.files?.foto_usaha?.[0];
        const gaji_ortu = req.files?.gaji_ortu?.[0];

        if (!photo_ktp || !photo_kk) {
            return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
        }

        const photo_ktp_url = await R2Service.uploadFile(photo_ktp.buffer, photo_ktp.mimetype);
        const photo_kk_url = await R2Service.uploadFile(photo_kk.buffer, photo_kk.mimetype);
        const foto_usaha_url = foto_usaha ? await R2Service.uploadFile(foto_usaha.buffer, foto_usaha.mimetype) : null;
        const gaji_ortu_url = gaji_ortu ? await R2Service.uploadFile(gaji_ortu.buffer, gaji_ortu.mimetype) : null;

        let parsedTanggalLahir = null;
        if (tanggal_lahir) {
            const m = moment.tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta");
            if (!m.isValid()) {
                return res.status(400).json({ message: "Format tanggal_lahir tidak valid!" });
            }
            parsedTanggalLahir = m.add(1, "day").toDate();
        }

        const newSurat = await suratService.createSurat({
            nik, nama, tempat_lahir, tanggal_lahir: parsedTanggalLahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian,
            photo_ktp_url, photo_kk_url, foto_usaha_url, gaji_ortu_url,
            tanggal: moment().tz("Asia/Jakarta").toDate(),
        });
        
        await NotificationService.sendSuratNotification(newSurat);
        
        res.status(201).json({
            message: "Surat berhasil dibuat!",
            data: newSurat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateSurat = async (req, res) => {
    try {
        const { nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian, status } = req.body;
        
        const oldSurat = await suratService.getSuratById(req.params.id);
        if (!oldSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });

        const photo_ktp = req.files?.photo_ktp?.[0];
        const photo_kk = req.files?.photo_kk?.[0];
        const foto_usaha = req.files?.foto_usaha?.[0];
        const gaji_ortu = req.files?.gaji_ortu?.[0];

        let photo_ktp_url = photo_ktp ? await R2Service.uploadFile(photo_ktp.buffer, photo_ktp.mimetype) : oldSurat.photo_ktp_url;
        let photo_kk_url = photo_kk ? await R2Service.uploadFile(photo_kk.buffer, photo_kk.mimetype) : oldSurat.photo_kk_url;
        let foto_usaha_url = foto_usaha ? await R2Service.uploadFile(foto_usaha.buffer, foto_usaha.mimetype) : oldSurat.foto_usaha_url;
        let gaji_ortu_url = gaji_ortu ? await R2Service.uploadFile(gaji_ortu.buffer, gaji_ortu.mimetype) : oldSurat.gaji_ortu_url;

        let parsedTanggalLahir = null;
        if (tanggal_lahir && typeof tanggal_lahir === "string" && tanggal_lahir.trim() !== "") {
            parsedTanggalLahir = moment.tz(tanggal_lahir, "DD/MM/YYYY", "Asia/Jakarta").add(1, "day").toDate();
            if (isNaN(parsedTanggalLahir.getTime())) return res.status(400).json({ message: "Format tanggal_lahir tidak valid!" });
        }

        const updatePayload = {
            nik, nama, tempat_lahir, tanggal_lahir: parsedTanggalLahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian, status,
            photo_ktp_url, photo_kk_url, foto_usaha_url, gaji_ortu_url,
        };

        const updatedSurat = await suratService.updateSurat(req.params.id, updatePayload);
        if (!updatedSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });
        
        if (status && oldSurat.status !== updatedSurat.status) {
            await NotificationService.sendSuratStatusNotification(updatedSurat);
        }

        res.status(200).json({
            message: "Surat berhasil diperbarui!",
            data: updatedSurat,
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSurat = async (req, res) => {
    try {
        const deleted = await suratService.deleteSurat(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Surat tidak ditemukan!" });
        res.status(200).json({ message: "Surat berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};

exports.printSurat = async (req, res) => {
    try {
        const suratId = req.params.id;
        const pdfBuffer = await PdfService.generateSuratPdf(suratId);
        
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="surat-${suratId}.pdf"`,
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal mencetak surat");
    }
};