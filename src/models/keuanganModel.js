const { PrismaClient } = require("@prisma/client");
const { keuangan } = require("../prisma/prismaClient");
const prisma = new PrismaClient();

exports.create = ({
  jenisTransaksi,
  keterangan,
  kategori,
  tanggal,
  jumlah,
  catatan,
}) =>
  prisma.Keuangan.create({
    data: {
      jenisTransaksi,
      keterangan,
      kategori,
      tanggal,
      jumlah,
      catatan,
    },
  });

exports.findAll = () => prisma.Keuangan.findMany();

exports.findById = (id) =>
  prisma.Keuangan.findUnique({ where: { keuangan_id: Number(id) } });

exports.update = (id, data) =>
  prisma.Keuangan.update({ where: { keuangan_id: Number(id) }, data }).catch(
    () => null
  );

exports.delete = (id) =>
  prisma.Keuangan.delete({ where: { keuangan_id: Number(id) } });
