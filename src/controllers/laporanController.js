const laporanService = require("../services/laporanService");
const { handleError } = require("../utils/errorrHandler");
const moment = require("moment-timezone");
const { io } = require("../index");

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
    const { nama, keluhan, deskripsi, lokasi, vote, photo: photoBase64 } = req.body;

    if (!nama || !lokasi || !keluhan || !deskripsi) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    const status = "belum dikerjakan";
    const tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ss");

    const data = {
      nama,
      keluhan,
      tanggal,
      lokasi,
      deskripsi,
      vote,
      status,
      ...(photoBase64 && {
        photo: Buffer.from(photoBase64.split(',')[1], 'base64'),
      }),
    };

    const newLaporan = await laporanService.createLaporan(data);

    io.emit("notification", {
      title: "Laporan Baru",
      body: `${nama} mengirim laporan: ${keluhan}`,
      time: timestamp,
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
