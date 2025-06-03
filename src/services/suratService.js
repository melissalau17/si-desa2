const suratModel = require("../models/SuratModel");
const { Buffer } = require("buffer");

exports.getAllSurat = () => suratModel.findAll();

exports.getSuratById = (id) => suratModel.findById(id);

exports.findByNIK = (NIK) => suratModel.findByNIK(NIK);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.createSurat = (data) => {
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
    photo_ktp,
    photo_kk,
  } = data;

  return suratModel.create({
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
    photo_ktp,
    photo_kk,
  });
};

exports.updateSurat = async (id, data, base64Photo) => {
  const existingSurat = await suratModel.findById(id);
  if (!existingSurat) return null;

  const updateData = {
    NIK: data.NIK,
    nama: data.nama,
    tempat_lahir: data.tempat_lahir,
    tanggal_lahir: data.tanggal_lahir ?? existingSurat.tanggal_lahir,
    jenis_kelamin: data.jenis_kelamin,
    agama: data.agama,
    alamat: data.alamat,
    no_hp: data.no_hp,
    email: data.email,
    tujuan_surat: data.tujuan_surat,
    jenis_surat: data.jenis_surat,
    photo_kk: data.photo_kk ?? existingSurat.photo_kk,
    photo_ktp: data.photo_ktp ?? existingSurat.photo_ktp,
  };

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }
  return suratModel.update(id, updateData);
};

exports.deleteSurat = (id) => suratModel.remove(id);
