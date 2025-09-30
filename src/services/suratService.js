const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function normalizeSuratPhotos(surat) {
  if (!surat) return null;
  return {
    ...surat,
    photo_ktp_url: surat.photo_ktp
      ? surat.photo_ktp.startsWith('http')
        ? surat.photo_ktp
        : `${PUBLIC_URL}/${surat.photo_ktp}`
      : null,
    photo_kk_url: surat.photo_kk
      ? surat.photo_kk.startsWith('http')
        ? surat.photo_kk
        : `${PUBLIC_URL}/${surat.photo_kk}`
      : null,
  };
}

exports.countAll = () => prisma.surat.count();

exports.countNew = () => {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.surat.count({
    where: {
      createdAt: {
        gte: last7Days,
      },
    },
  });
};

exports.getLatest = (limit = 5) =>
  prisma.surat.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

exports.getAllSurat = async () => {
  const surats = await prisma.surat.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return surats.map(normalizeSuratPhotos);
};

exports.getSuratById = async (id) => {
  const surat = await prisma.surat.findUnique({
    where: { surat_id: parseInt(id) },
  });
  return normalizeSuratPhotos(surat);
};

exports.findByNIK = async (nik) => {
  if (!nik) return null; 
  const surat = await prisma.surat.findFirst({
    where: { nik },
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
  });

  return normalizeSuratPhotos(updatedSurat);
};

exports.deleteSurat = async (id) =>
  prisma.surat.delete({
    where: { surat_id: parseInt(id) },
  });
