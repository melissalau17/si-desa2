const keuanganService = require("../services/keuanganService");
const { handleError } = require("../utils/errorrHandler");

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
    res.status(201).json(newKeuangan);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAllKeuangan = async (req, res) => {
  try {
    const result = await keuanganService.getAllKeuangan();
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getKeuanganById = async (req, res) => {
  try {
    const item = await keuanganService.getKeuanganById(req.params.id);
    if (!item) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(item);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateKeuangan = async (req, res) => {
  try {
    const { jenisTransaksi, keterangan, kategori, tanggal, jumlah, catatan } =
      req.body;
    const updated = await keuanganService.updateKeuangan(req.params.id, {
      jenisTransaksi,
      keterangan,
      kategori,
      tanggal,
      jumlah,
      catatan,
    });
    if (!updated)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteKeuangan = async (req, res) => {
  try {
    const deleted = await keuanganService.deleteKeuangan(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};
