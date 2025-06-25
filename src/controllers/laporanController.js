const laporanService = require("../services/laporanService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");

exports.getAllLaporans = async (req, res) => {
  try {
    const laporans = await laporanService.getAllLaporans();
    if (!laporans || laporans.length === 0) {
      return res.status(200).json({
        message: "Tidak ada data laporan tersedia!",
        data: [],
      });
    }

    res.status(201).json({
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
    res.status(201).json({
      message: `Laporan dengan ID  ${req.params.id} berhasil dimuat!`,
      data: laporan,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createLaporan = async (req, res) => {
  try {
    const { nama, keluhan, deskripsi, lokasi, vote } = req.body;

    if (!nama || !lokasi || !keluhan || !deskripsi) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    status = "belm dikerjakan";
    // Ambil waktu sekarang dalam zona Asia/Jakarta (WIB) dan formatkan dalam ISO 8601
    const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss"); // Tanpa 'Z' untuk zona WIB

    const photo = req.file ? req.file.buffer : null;
    const newLaporan = await laporanService.createLaporan({
      nama,
      keluhan,
      tanggal, // Waktu yang sudah dalam format ISO-8601 tanpa 'Z' (WIB)
      lokasi,
      deskripsi,
      photo,
      vote,
      status,
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
    const { nama, deskripsi, lokasi, keluhan, vote } = req.body;

    const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

    const photo = req.file ? req.file.buffer.toString("base64") : null;

    // ambil vote lama jika ada
    const laporan = await laporanService.getLaporanById(req.params.id);
    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan!" });
    }

    const voteCount = vote !== undefined ? parseInt(vote) : laporan.vote;
    let status = "";

    if (voteCount >= 50) {
      status = "Sedang Dikerjakan";
    } else if (voteCount <= 49) {
      status = "Belum Dikerjakan";
    }

    const updatedLaporan = await laporanService.updateLaporan(
      req.params.id,
      {
        nama,
        deskripsi,
        tanggal,
        lokasi,
        keluhan,
        vote,
        status,
      },
      photo
    );

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

    res.status(200).json({ message: ":Laporan berhasil dihapus!" });
  } catch (error) {
    handleError(res, error);
  }
};
