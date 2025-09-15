const keuanganService = require("../services/keuanganService");
const { handleError } = require("../utils/errorHandler");

exports.createKeuangan = async (req, res) => {
  try {
    const { jenisTransaksi, keterangan, kategori, tanggal, jumlah, catatan } =
      req.body;

    const newKeuangan = await keuanganService.createKeuangan({
      jenisTransaksi,
      keterangan,
      kategori,
      tanggal,
      jumlah: parseFloat(jumlah),
      catatan,
    });

    res.status(201).json({
      message: "Data keuangan berhasil ditambahkan!",
      data: newKeuangan,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAllKeuangan = async (req, res) => {
  try {
    const result = await keuanganService.getAllKeuangan();

    if (!result || result.length === 0) {
      return res.status(200).json({
        message: "Tidak ada data keuangan tersedia!",
        data: [],
      });
    }

    res.status(200).json({
      message: "Data keuangan berhasil diambil!",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getKeuanganById = async (req, res) => {
  try {
    const item = await keuanganService.getKeuanganById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Data keuangan tidak ditemukan!" });
    }

    res.status(200).json({
      message: "Data keuangan berhasil ditemukan!",
      data: item,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateKeuangan = async (req, res) => {
  try {
    const { jenisTransaksi } = req.body;
    const { keterangan, kategori, tanggal, jumlah, catatan } = req.body;
    const updated = await keuanganService.updateKeuangan(
      req.params.id,
      {
        jenisTransaksi,
        keterangan,
        kategori,
        tanggal,

        catatan,
      },
      parseFloat(jumlah)
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Data keuangan tidak ditemukan!" });
    }
    res.status(200).json({
      message: "Data keuangan berhasil diperbarui!",
      data: updated,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteKeuangan = async (req, res) => {
  try {
    const deleted = await keuanganService.deleteKeuangan(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Data keuangan tidak ditemukan!" });
    }

    res.status(200).json({
      message: "Data keuangan berhasil dihapus!",
    });
  } catch (error) {
    handleError(res, error);
  }
};
