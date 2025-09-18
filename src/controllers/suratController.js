// In your suratController.js

const suratService = require("../services/suratService");
const { handleError } = require("../utils/errorHandler");
const R2Service = require("../services/r2Service");
const { sendSuratNotification, sendSuratStatusNotification } = require("../services/notificationService");
const moment = require("moment-timezone");
const PdfService = require("../services/pdfService");

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
        const { nik, nama, tempat_lahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian } = req.body;

        const photo_ktp = req.files?.photo_ktp?.[0];
        const photo_kk = req.files?.photo_kk?.[0];

        if (!photo_ktp || !photo_kk) {
            return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
        }

        const photo_ktp_url = await R2Service.uploadFile(photo_ktp.buffer, photo_ktp.mimetype);
        const photo_kk_url = await R2Service.uploadFile(photo_kk.buffer, photo_kk.mimetype);

        const newSurat = await suratService.createSurat({
            nik, nama, tempat_lahir, jenis_kelamin, agama, alamat, no_hp, email, jenis_surat, tujuan_surat, waktu_kematian,
            photo_ktp_url, photo_kk_url,
            tanggal: moment().tz("Asia/Jakarta").toDate(),
        });
        
        await sendSuratNotification(newSurat);
        
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
        const { status } = req.body;
        const suratId = req.params.id;
        
        // Fetch the old surat data to compare the status later
        const oldSurat = await suratService.getSuratById(suratId);
        if (!oldSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });

        // Normalize the status value to lowercase to avoid case-sensitivity issues
        const newStatus = status ? status.toLowerCase() : undefined;

        // Check if the status is actually changing to avoid unnecessary updates
        if (newStatus && oldSurat.status === newStatus) {
            return res.status(200).json({
                message: "Status surat tidak berubah!",
                data: oldSurat,
            });
        }

        const updatePayload = {
            // Only update the status field
            status: newStatus,
        };

        const updatedSurat = await suratService.updateSurat(suratId, updatePayload);
        if (!updatedSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });
        
        // If the status has actually changed, send a notification
        if (newStatus && oldSurat.status !== updatedSurat.status) {
            await sendSuratStatusNotification(updatedSurat);
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
        
        if (!PdfService) {
            console.error("PdfService module is not available.");
            return res.status(500).send("Gagal mencetak surat: PdfService tidak ditemukan.");
        }

        const pdfBuffer = await PdfService.generateSuratPdf(suratId);
        
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="surat-${suratId}.pdf"`,
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error("Error in printSurat controller:", err);
        res.status(500).send(`Gagal mencetak surat: ${err.message || "Kesalahan internal server."}`);
    }
};