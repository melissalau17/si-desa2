const suratService = require("../services/suratService");
const { handleError } = require("../utils/errorHandler");
const R2Service = require("../services/r2Service");
const { sendSuratNotification, sendSuratStatusNotification } = require("../services/notificationService");
const moment = require("moment-timezone");
const PdfService = require("../services/pdfService");
const emitDashboardUpdate = require("../utils/emitDashboardUpdate");

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
    const {
      nama,
      nik,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      jenis_surat,
      tujuan_surat,
      waktu_kematian,
      gaji_ortu,
      foto_usaha,
    } = req.body;

    const parsedTanggalLahir = tanggal_lahir
    ? moment(tanggal_lahir, "DD-MM-YYYY", true).isValid()
        ? moment(tanggal_lahir, "DD-MM-YYYY").toDate()
        : null
    : null;

    if (!nama || !nik || !alamat || !jenis_surat || !tujuan_surat) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const photo_ktp = req.files?.photo_ktp?.[0];
    const photo_kk = req.files?.photo_kk?.[0];

    if (!photo_ktp || !photo_kk) {
      return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
    }

    const photo_ktp_url = await R2Service.uploadFile(photo_ktp.buffer, photo_ktp.mimetype);
    const photo_kk_url = await R2Service.uploadFile(photo_kk.buffer, photo_kk.mimetype);

    const newSurat = await suratService.createSurat({
      nama,
      nik,
      tempat_lahir,
      tanggal_lahir: parsedTanggalLahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp: no_hp || null,
      email: email || null,
      jenis_surat,
      tujuan_surat,
      waktu_kematian: waktu_kematian ? new Date(waktu_kematian) : null,
      gaji_ortu: gaji_ortu || null,
      foto_usaha: foto_usaha || null,
      photo_ktp_url,
      photo_kk_url,
      tanggal: moment().tz("Asia/Jakarta").toDate(),
      createdBy: parseInt(userId, 10),
    });

    await sendSuratNotification(newSurat);
    if (req.io) {
        await emitDashboardUpdate(req.io);
    }

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

    const oldSurat = await suratService.getSuratById(suratId);
    if (!oldSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });

    if (status && oldSurat.status === status) {
      return res.status(200).json({
        message: "Status surat tidak berubah!",
        data: oldSurat,
      });
    }

    const updatedSurat = await suratService.updateSurat(suratId, { status });
    if (!updatedSurat) return res.status(404).json({ message: "Surat tidak ditemukan!" });

    if (status && oldSurat.status !== updatedSurat.status) {
      await sendSuratStatusNotification(updatedSurat);
    }
    if (req.io) {
        await emitDashboardUpdate(req.io);
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
        if (req.io) {
            await emitDashboardUpdate(req.io);
        }
        res.status(200).json({ message: "Surat berhasil dihapus!" });
    } catch (error) {
        handleError(res, error);
    }
};

exports.printSurat = async (req, res) => {
  try {
    const suratId = req.params.id;
    console.log("Generating PDF for surat ID:", suratId);

    const pdfBuffer = await PdfService.generateSuratPdf(suratId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="surat-${suratId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in printSurat controller:", error);
    res.status(500).json({
      message: "Gagal generate surat",
      error: error.message,
      stack: error.stack,
    });
  }
};