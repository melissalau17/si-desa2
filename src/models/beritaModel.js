const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.Berita.findMany();

exports.findById = (id) =>
  prisma.Berita.findUnique({ where: { berita_id: Number(id) } });

exports.create = ({ judul, kategori, photo_url, tanggal, kontent, status }) =>
  prisma.Berita.create({
    data: {
      judul,
      kategori,
      photo_url,
      tanggal,
      kontent,
      status,
    },
  });

exports.update = (id, data) =>
  prisma.Berita.update({ where: { berita_id: Number(id) }, data }).catch(
    () => null
  );

exports.remove = (id) =>
  prisma.Berita.delete({ where: { berita_id: Number(id) } }).catch(() => null);
