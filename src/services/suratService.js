const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function normalizeSuratPhotos(surat) {
  if (!surat) return null;
  return {
    ...surat,
    photo_ktp_url: surat.photo_ktp_url
      ? surat.photo_ktp_url.startsWith("http")
        ? surat.photo_ktp_url
        : `${PUBLIC_URL}/${surat.photo_ktp_url}`
      : null,
    photo_kk_url: surat.photo_kk_url
      ? surat.photo_kk_url.startsWith("http")
        ? surat.photo_kk_url
        : `${PUBLIC_URL}/${surat.photo_kk_url}`
      : null,
  };
}

exports.countAll = () => prisma.surat.count();

exports.countNew = () =>
  prisma.surat.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)), // last 7 days
      },
    },
  });

exports.getLatest = (limit = 5) =>
  prisma.surat.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

exports.getAllSurat = async () => {
  const surats = await prisma.surat.findMany({
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return surats.map(s => normalizeSuratPhotos(s));
};

exports.getSuratById = async (id) => {
  const surat = await prisma.surat.findUnique({
    where: { surat_id: parseInt(id) },
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });
  return normalizeSuratPhotos(surat);
};

exports.findByNIK = async (nik) => {
  const surat = await prisma.surat.findFirst({
    where: { nik },
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });
  return normalizeSuratPhotos(surat);
};

exports.createSurat = async (data) => {
  const { user_id, ...rest } = data;

  const newSurat = await prisma.surat.create({
    data: {
      ...rest,
      createdBy: user_id, 
    },
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });

  return normalizeSuratPhotos(newSurat);
};

exports.updateSurat = async (id, data) => {
  const existing = await prisma.surat.findUnique({
    where: { surat_id: parseInt(id) },
  });
  if (!existing) return null;

  const updatedSurat = await prisma.surat.update({
    where: { surat_id: parseInt(id) },
    data,
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });

  return normalizeSuratPhotos(updatedSurat);
};

exports.deleteSurat = async (id) => {
  return await prisma.surat.delete({
    where: { surat_id: parseInt(id) },
  });
};
