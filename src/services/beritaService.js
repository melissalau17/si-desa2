const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function normalizePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  return photoUrl.startsWith("http") ? photoUrl : `${PUBLIC_URL}/${photoUrl}`;
}

exports.countAll = () => prisma.berita.count();

exports.countNewThisWeek = () =>
  prisma.berita.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
  });

exports.getLatest = (limit = 5) =>
  prisma.berita.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

exports.getAllBeritas = async () => {
  const beritas = await prisma.berita.findMany({
    include: {
      author: { select: { nama: true, user_id: true } }, 
    },
    orderBy: { createdAt: "desc" },
  });

  return beritas.map(b => ({ ...b, photo_url: normalizePhotoUrl(b.photo_url) }));
};

exports.getBeritaById = async (berita_id) => {
  const berita = await prisma.berita.findUnique({
    where: { berita_id: parseInt(berita_id, 10) },
    include: {
      author: { select: { nama: true, user_id: true } },
    },
  });
  if (!berita) return null;
  return { ...berita, photo_url: normalizePhotoUrl(berita.photo_url) };
};

exports.createBerita = async (data) => {
  const { judul, kategori, photo_url, tanggal, kontent, status, user_id } = data;

  const newBerita = await prisma.berita.create({
    data: {
      judul,
      kategori,
      tanggal,
      kontent,
      status,
      photo_url,
      createdBy: user_id,  
    },
    include: {
      author: { select: { nama: true, user_id: true } },
    },
  });

  return { ...newBerita, photo_url: normalizePhotoUrl(newBerita.photo_url) };
};

exports.updateBerita = async (berita_id, data, photoUrl) => {
  const existing = await prisma.berita.findUnique({
    where: { berita_id: parseInt(berita_id, 10) },
  });
  if (!existing) return null;

  const updateData = {
    judul: data.judul,
    kategori: data.kategori,
    tanggal: data.tanggal,
    kontent: data.kontent,
    status: data.status,
    photo_url: existing.photo_url,
  };

  if (photoUrl) {
    if (existing.photo_url) {
      const oldKey = existing.photo_url.replace(`${PUBLIC_URL}/`, "");
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: oldKey,
      }));
    }
    updateData.photo_url = photoUrl;
  } else if (data.photo_url === null && existing.photo_url) {
    const oldKey = existing.photo_url.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldKey,
    }));
    updateData.photo_url = null;
  }

  const updated = await prisma.berita.update({
    where: { berita_id: parseInt(berita_id, 10) },
    data: updateData,
    include: {
      author: { select: { nama: true, user_id: true } },
    },
  });

  return { ...updated, photo_url: normalizePhotoUrl(updated.photo_url) };
};

exports.deleteBerita = async (berita_id) => {
  const berita = await prisma.berita.findUnique({
    where: { berita_id: parseInt(berita_id, 10) },
  });
  if (!berita) return null;

  if (berita.photo_url) {
    const key = berita.photo_url.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
  }

  return await prisma.berita.delete({
    where: { berita_id: parseInt(berita_id, 10) },
  });
};
