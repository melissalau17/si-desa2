const laporanModel = require("../models/laporanModel");
const { Buffer } = require("buffer");

exports.getAllLaporans = () => laporanModel.findAll();

exports.getLaporanById = (id) => laporanModel.findById(id);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.createLaporan = async (data) => {
  const { nama, keluhan, photo, tanggal, deskripsi, lokasi, vote, status } =
    data;

  // Jika ada foto, simpan foto sebagai Buffer atau path
  let photoBuffer = null;
  if (photo) {
    photoBuffer = photo.file ? photo.file : photo; // Menyimpan foto sebagai Buffer
  }

  // Simpan berita ke dalam database
  return laporanModel.create({
    nama,
    keluhan,
    tanggal,
    deskripsi,
    lokasi,
    vote,
    status,
    photo: photoBuffer, // Simpan foto sebagai Buffer
  });
};

exports.updateLaporan = async (id, data, base64Photo) => {
  const existingLaporan = await laporanModel.findById(id);
  if (!existingLaporan) return null;
  const updateData = {
    nama: data.nama,
    keluhan: data.keluhan,
    photo: data.photo ?? existingLaporan.photo,
    tanggal: data.tanggal,
    deskripsi: data.deskripsi,
    lokasi: data.lokasi,
    vote: data.vote,
    status: data.status,
  };

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }
  //   console.log("UPDATE DATA YANG DIKIRIM KE PRISMA:", updateData);

  return laporanModel.update(id, updateData);
};

exports.deleteLaporan = (id) => laporanModel.remove(id);
