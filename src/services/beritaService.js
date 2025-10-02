const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const normalizePhotoUrl = require('../utils/normalizePhotoUrl'); 

const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL;

exports.countAll = () => prisma.berita.count();

exports.countNewThisWeek = () => {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return prisma.berita.count({
    where: { createdAt: { gte: last7Days } },
  });
};

exports.getLatest = (limit = 5) =>
  prisma.berita.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

exports.getAllBeritas = async () => {
  try {
    const beritas = await prisma.berita.findMany({ orderBy: { createdAt: "desc" } });
    console.log("Beritas fetched:", beritas);
    return beritas.map(b => ({ ...b, photo_url: normalizePhotoUrl(b.photo_url) }));
  } catch (err) {
    console.error("Error fetching all beritas:", err);
    return [];
  }
};

exports.getBeritaById = async (berita_id) => {
  try {
    const berita = await prisma.berita.findUnique({
      where: { berita_id: parseInt(berita_id, 10) },
    });
    if (!berita) return null;
    return { ...berita, photo_url: normalizePhotoUrl(berita.photo_url) };
  } catch (err) {
    console.error("Error fetching berita by ID:", err);
    return null;
  }
};

exports.createBerita = async (data) => {
  const { judul, kategori, photo_url, tanggal, kontent, status, user_id } = data;
  try {
    const newBerita = await prisma.berita.create({
      data: {
        judul, kategori, tanggal, kontent, status, photo_url, createdBy: user_id,
      },
    });
    return { ...newBerita, photo_url: normalizePhotoUrl(newBerita.photo_url) };
  } catch (err) {
    console.error("Error creating berita:", err);
    throw err;
  }
};

exports.updateBerita = async (berita_id, data, photoUrl) => {
  try {
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
    });

    return { ...updated, photo_url: normalizePhotoUrl(updated.photo_url) };
  } catch (err) {
    console.error("Error updating berita:", err);
    return null;
  }
};

exports.deleteBerita = async (berita_id) => {
  try {
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
  } catch (err) {
    console.error("Error deleting berita:", err);
    return null;
  }
};
