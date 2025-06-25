const prisma = require("../prisma/prismaClient");

// Ambil semua data surat
exports.findAll = () => prisma.surat.findMany();

// Ambil surat berdasarkan ID
exports.findById = (id) =>
  prisma.surat.findUnique({
    where: { surat_id: Number(id) },
  });

// Buat surat baru
exports.create = ({
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
}) =>
  prisma.surat.create({
    data: {
      nik,
      nama,
      tempat_lahir,
      tanggal_lahir: new Date(tanggal_lahir),
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
    },
  });

// Update surat berdasarkan ID
exports.update = (id, data) =>
  prisma.surat
    .update({
      where: { surat_id: Number(id) },
      data,
    })
    .catch(() => null);

// Hapus surat berdasarkan ID
exports.remove = (id) =>
  prisma.surat
    .delete({
      where: { surat_id: Number(id) },
    })
    .catch(() => null);

// Cari surat berdasarkan NIK
exports.findByNIK = (nik) =>
  prisma.surat.findFirst({
    where: { nik },
  });
