const suratService = require("../services/suratService");
const { handleError } = require("../utils/errorrHandler");
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
    const {
      NIK,
      nama,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      tujuan_surat,
      jenis_surat,
    } = req.body;

    if (!NIK.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    const existingSurat = await suratService.findByNIK(NIK);
    if (existingSurat) {
      return res.status(409).json({ message: "NIK sudah terdaftar!" });
    }

    const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
    const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;

    if (!photo_ktp || !photo_kk) {
      return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
    }

    // Parse "DD-MM-YYYY" ke objek Date valid di zona Asia/Jakarta
    const parsedTanggalLahir = moment
      .tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta")
      .toDate();

    // Validasi apakah hasil parsing benar
    if (!parsedTanggalLahir || isNaN(parsedTanggalLahir.getTime())) {
      return res
        .status(400)
        .json({ message: "Format tanggal_lahir tidak valid!" });
    }

    const newSurat = await suratService.createSurat({
      NIK,
      nama,
      tempat_lahir,
      tanggal_lahir: parsedTanggalLahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      tujuan_surat,
      jenis_surat,
      photo_kk,
      photo_ktp,
    });

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
    const {
      NIK,
      nama,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      tujuan_surat,
      jenis_surat,
    } = req.body;

    const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
    const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;
    if (NIK && !NIK.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    // Cek NIK duplikat kalau ada perubahan
    if (NIK) {
      const existingSurat = await suratService.findByNIK(NIK);
      if (existingSurat && existingSurat.surat_id != req.params.id) {
        return res
          .status(409)
          .json({ message: "NIK sudah digunakan oleh surat lain!" });
      }
    }

    // Parse tanggal_lahir jika ada
    let parsedTanggalLahir = undefined;
    if (tanggal_lahir) {
      parsedTanggalLahir = moment
        .tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta")
        .toDate();

      if (isNaN(parsedTanggalLahir.getTime())) {
        return res
          .status(400)
          .json({ message: "Format tanggal_lahir tidak valid!" });
      }
    }

    const updatedSurat = await suratService.updateSurat(req.params.id, {
      NIK,
      nama,
      tempat_lahir,
      tanggal_lahir: parsedTanggalLahir,
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      tujuan_surat,
      jenis_surat,
      photo_kk,
      photo_ktp,
    });

    if (!updatedSurat) {
      return res.status(404).json({ message: "Surat tidak ditemukan!" });
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

    if (!deleted) {
      return res.status(404).json({ message: "Surat tidak ditemukan!" });
    }

    res.status(200).json({ message: "Surat berhasil dihapus!" });
  } catch (error) {
    handleError(res, error);
  }
};
