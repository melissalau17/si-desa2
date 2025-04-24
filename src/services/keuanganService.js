const keuanganModel = require("../models/keuanganModel");

exports.createKeuangan = async (data) => {
  const { jenisTransaksi, keterangan, kategori, tanggal, jumlah, catatan } =
    data;
  return keuanganModel.create({
    jenisTransaksi,
    keterangan,
    kategori,
    tanggal,
    jumlah: parseFloat(jumlah),
    catatan,
  });
};

exports.getAllKeuangan = async () => {
  return keuanganModel.findAll();
};

exports.getKeuanganById = async (id) => {
  return keuanganModel.findById(id);
};

exports.updateKeuangan = async (id, data) => {
  const updateData = {
    jenisTransaksi: data.jenisTransaksi,
    keterangan: data.keterangan,
    kategori: data.kategori,
    tanggal: data.tanggal,
    jumlah: data.jumlah,
    catatan: data.catatan,
  };
  return keuanganModel.update(id, updateData);
};

exports.deleteKeuangan = async (id) => {
  return keuanganModel.delete(id);
};
