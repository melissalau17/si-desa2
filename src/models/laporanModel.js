const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.Laporan.findMany();

exports.findById = (id) =>
  prisma.Laporan.findUnique({ where: { laporan_id: Number(id) } });

exports.create = ({
  nama,
  keluhan,
  photo,
  tanggal,
  deskripsi,
  lokasi,
  vote,
  status,
}) =>
  prisma.Laporan.create({
    data: {
      nama,
      keluhan,
      photo,
      tanggal,
      deskripsi,
      lokasi,
      vote,
      status,
    },
  });

exports.update = (id, data) =>
  prisma.Laporan.update({ where: { laporan_id: Number(id) }, data }).catch(
    () => null
  );

exports.remove = (id) =>
  prisma.Laporan.delete({ where: { laporan_id: Number(id) } }).catch(
    () => null
  );
