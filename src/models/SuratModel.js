const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.surat.findMany();

exports.findById = (id) =>
  prisma.surat.findUnique({
    where: { surat_id: Number(id) },
  });

const parseDateSafe = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

exports.create = ({
  nik,
  nama,
  tempat_lahir,
  tanggal_lahir,
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
      tempat_lahir: tempat_lahir || null,
      tanggal_lahir: parseDateSafe(tanggal_lahir),
      no_hp: no_hp || null,
      email: email || null,
      jenis_kelamin: jenis_kelamin || null,
      agama: agama || null,
      alamat,
      jenis_surat,
      tujuan_surat,
      photo_ktp: photo_ktp || null,
      photo_kk: photo_kk || null,
      foto_usaha: foto_usaha || null,
      waktu_kematian: parseDateSafe(waktu_kematian),
      gaji_ortu: gaji_ortu || null,
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

exports.findByNIK = (nik) =>
  prisma.surat.findFirst({
    where: { nik },
  });
