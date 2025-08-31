const beritaModel = require("../models/beritaModel");
const { Buffer } = require("buffer");

exports.getAllBeritas = () => beritaModel.findAll();

exports.getBeritaById = (berita_id) => beritaModel.findById(berita_id);

// Fungsi untuk mengubah Base64 ke binary
const convertBase64ToBinary = (base64String) => {
  const buffer = Buffer.from(base64String, "base64"); // Convert Base64 ke Binary
  return buffer;
};

exports.createBerita = async (data) => {
  const { judul, kategori, photo, tanggal, kontent, status } = data;

  // Jika ada foto, simpan foto sebagai Buffer atau path
  let photoBuffer = null;
  if (photo) {
    photoBuffer = photo.file ? photo.file : photo; // Menyimpan foto sebagai Buffer
  }

  // Simpan berita ke dalam database
  return beritaModel.create({
    judul,
    kategori,
    tanggal,
    kontent,
    status,
    photo: photoBuffer, // Simpan foto sebagai Buffer
  });
};

exports.updateBerita = async (berita_id, data, base64Photo) => {
  const existingBerita = await beritaModel.findById(berita_id);
  if (!existingBerita) return null;
  const updateData = {
    judul: data.judul,
    kategori: data.kategori,
    photo: data.photo ?? existingBerita.photo,
    tanggal: data.tanggal,
    kontent: data.kontent,
    status: data.status,
  };

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo); // Convert Base64 ke Binary (BLOB)
  }

  return beritaModel.update(berita_id, updateData);
};

exports.deleteBerita = (berita_id) => beritaModel.remove(berita_id);
