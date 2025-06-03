const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.surat.findMany();

exports.findById = (id) =>
  prisma.surat.findUnique({
    where: { surat_id: Number(id) },
  });

exports.create = ({
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
}) =>
  prisma.surat.create({
    data: {
      NIK,
      nama,
      tempat_lahir,
      tanggal_lahir: new Date(tanggal_lahir),
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      tujuan_surat,
      jenis_surat,
      photo_ktp,
      photo_kk,
    },
  });

exports.update = (id, data) =>
  prisma.surat
    .update({
      where: { surat_id: Number(id) },
      data,
    })
    .catch(() => null);

exports.remove = (id) =>
  prisma.surat
    .delete({
      where: { surat_id: Number(id) },
    })
    .catch(() => null);

exports.findByNIK = (NIK) =>
  prisma.surat.findUnique({
    where: { NIK },
  });
