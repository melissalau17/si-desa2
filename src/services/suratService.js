const suratModel = require("../models/SuratModel");
const { Buffer } = require("buffer");

// Ambil semua surat
exports.getAllSurat = () => suratModel.findAll();

// Ambil surat berdasarkan ID
exports.getSuratById = (id) => suratModel.findById(id);

// Cari surat berdasarkan NIK
exports.findByNIK = (nik) => suratModel.findByNIK(nik);

const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

// Buat surat baru
exports.createSurat = (data) => {
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
    photo_ktp,
    photo_kk,
    foto_usaha,
    waktu_kematian,
    gaji_ortu,
  } = data;

  return suratModel.create({
    nik,
    nama,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    agama,
    alamat,
    jenis_surat,
    tujuan_surat,
    photo_ktp: photo_ktp ? convertBase64ToBinary(photo_ktp) : null,
    photo_kk: photo_kk ? convertBase64ToBinary(photo_kk) : null,
    foto_usaha: foto_usaha ? convertBase64ToBinary(foto_usaha) : null,
    waktu_kematian,
    gaji_ortu: gaji_ortu ? convertBase64ToBinary(gaji_ortu) : null,
  });
};

// Update surat berdasarkan ID
exports.updateSurat = async (id, data, base64Photo) => {
  const existingSurat = await suratModel.findById(id);
  if (!existingSurat) return null;
  const updateData = {
    nik: data.nik,
    nama: data.nama,
    tempat_lahir: data.tempat_lahir,
    tanggal_lahir: data.tanggal_lahir,
    jenis_kelamin: data.jenis_kelamin,
    agama: data.agama,
    alamat: data.alamat,
    jenis_surat: data.jenis_surat,
    tujuan_surat: data.tujuan_surat,
    waktu_kematian: data.waktu_kematian,
    gaji_ortu: data.gaji_ortu ?? existingSurat.gaji_ortu,
    photo_ktp: data.photo_ktp ?? existingSurat.photo_ktp,
    photo_kk: data.photo_kk ?? existingSurat.photo_kk,
    foto_usaha: data.foto_usaha ?? existingSurat.foto_usaha,
  };

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }
  return suratModel.update(id, updateData);
};

// Hapus surat
exports.deleteSurat = (id) => suratModel.remove(id);
