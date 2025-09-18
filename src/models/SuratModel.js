const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.surat.findMany();

exports.findById = (id) =>
  prisma.surat.findUnique({
    where: { surat_id: Number(id) },
  });

exports.create = ({
  nik,
  nama,
  tempat_lahir,
//   tanggal_lahir,
  jenis_kelamin,
  agama,
  alamat,
  no_hp,
  email,
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
      tanggal_lahir: tanggal_lahir || null,
      no_hp: no_hp || null,
      email: email || null,
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
