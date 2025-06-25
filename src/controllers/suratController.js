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
      nik,
      nama,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      jenis_surat,
      tujuan_surat,
      waktu_kematian,
    } = req.body;

    if (!nik.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    //  const existingSurat = await suratService.findByNIK(nik);
    //  if (existingSurat) {
    //    return res.status(409).json({ message: "NIK sudah terdaftar!" });
    //  }

    const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;
    const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
    const foto_usaha = req.files?.foto_usaha?.[0]?.buffer || null;
    const gaji_ortu = req.files?.gaji_ortu?.[0]?.buffer || null;

    if (!photo_ktp || !photo_kk) {
      return res.status(400).json({ message: "KTP dan KK wajib diunggah!" });
    }

    // Pastikan format DD-MM-YYYY dikonversi ke objek Date
    const parsedTanggalLahir = moment
      .tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta")
      .add(+1, "day")
      .toDate();

    if (!parsedTanggalLahir || isNaN(parsedTanggalLahir.getTime())) {
      return res
        .status(400)
        .json({ message: "Format tanggal_lahir tidak valid!" });
    }

    const newSurat = await suratService.createSurat({
      nik,
      nama,
      tempat_lahir,
      tanggal_lahir: parsedTanggalLahir,
      jenis_kelamin,
      agama,
      alamat,
      jenis_surat,
      tujuan_surat,
      waktu_kematian,
      photo_ktp,
      photo_kk,
      foto_usaha,
      gaji_ortu,
      tanggal: moment().tz("Asia/Jakarta").toDate(),
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
      nik,
      nama,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      jenis_surat,
      tujuan_surat,
      waktu_kematian,
    } = req.body;

    const photo_ktp = req.files?.photo_ktp?.[0]?.buffer || null;
    const photo_kk = req.files?.photo_kk?.[0]?.buffer || null;
    const foto_usaha = req.files?.foto_usaha?.[0]?.buffer || null;
    const gaji_ortu = req.files?.gaji_ortu?.[0]?.buffer || null;

    if (nik && !nik.startsWith("120724")) {
      return res.status(403).json({ message: "Anda bukan warga desa ini!" });
    }

    //  if (nik) {
    //    const existingSurat = await suratService.findByNIK(nik);
    //    if (existingSurat && existingSurat.surat_id != req.params.id) {
    //      return res
    //        .status(409)
    //        .json({ message: "NIK sudah digunakan oleh surat lain!" });
    //    }
    //  }

    const parsedTanggalLahir = moment
      .tz(tanggal_lahir, "DD-MM-YYYY", "Asia/Jakarta")
      .add(+1, "day")
      .toDate();

    //  if (!parsedTanggalLahir || isNaN(parsedTanggalLahir.getTime())) {
    //    return res
    //      .status(400)
    //      .json({ message: "Format tanggal_lahir tidak valid!" });
    //  }

    const updatedSurat = await suratService.updateSurat(req.params.id, {
      nik,
      nama,
      tempat_lahir,
      tanggal_lahir: parsedTanggalLahir,
      jenis_kelamin,
      agama,
      alamat,
      jenis_surat,
      tujuan_surat,
      waktu_kematian,
      photo_ktp,
      photo_kk,
      foto_usaha,
      gaji_ortu,
    });

    if (!updatedSurat) {
      return res.status(404).json({ message: "Surat tidak ditemukan!" });
    }

    //  console.log("PARAMS ID:", req.params.id);

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
