const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function normalizePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  return photoUrl.startsWith("http") ? photoUrl : `${PUBLIC_URL}/${photoUrl}`;
}

exports.countAll = () => prisma.laporan.count();

exports.countNew = () =>
  prisma.laporan.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
  });

exports.getLatest = (limit = 5) =>
  prisma.laporan.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

exports.getAllLaporans = async () => {
  const laporans = await prisma.laporan.findMany({
    include: {
      author: { select: { no_hp: true, nama: true, user_id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return laporans.map(l => ({ ...l, photo_url: normalizePhotoUrl(l.photo_url) }));
};

exports.getLaporanById = async (id) => {
  const laporan = await prisma.laporan.findUnique({
    where: { laporan_id: parseInt(id) },
    include: {
      author: { select: { no_hp: true, nama: true, user_id: true } },
    },
  });
  if (!laporan) return null;
  return { ...laporan, photo_url: normalizePhotoUrl(laporan.photo_url) };
};

exports.createLaporan = async (data) => {
  const { keluhan, photo_url, tanggal, deskripsi, lokasi, vote, status, user_id } = data;

  const newLaporan = await prisma.laporan.create({
    data: {
      keluhan,
      tanggal,
      deskripsi,
      lokasi,
      vote: vote || 0,
      status,
      photo_url,
      createdBy: user_id, 
    },
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });

  return { ...newLaporan, photo_url: normalizePhotoUrl(newLaporan.photo_url) };
};

exports.updateLaporan = async (id, data) => {
  const { photoUrl, ...updatePayload } = data;

  if (photoUrl) {
    updatePayload.photo_url = photoUrl;
  }

  let updated = await prisma.laporan.update({
    where: { laporan_id: parseInt(id) },
    data: updatePayload,
    include: {
      author: { select: { nama: true, no_hp: true, user_id: true } },
    },
  });

  if (updated.vote >= 50 && updated.status !== "siap dikerjakan") {
    updated = await prisma.laporan.update({
      where: { laporan_id: parseInt(id) },
      data: { status: "siap dikerjakan" },
      include: {
        author: { select: { nama: true, no_hp: true, user_id: true } },
      },
    });
  }

  return { ...updated, photo_url: normalizePhotoUrl(updated.photo_url) };
};

exports.deleteLaporan = async (id) => {
  const laporan = await prisma.laporan.findUnique({
    where: { laporan_id: parseInt(id) },
    select: { photo_url: true },
  });

  if (laporan && laporan.photo_url) {
    const oldKey = laporan.photo_url.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldKey,
    }));
  }

  return await prisma.laporan.delete({
    where: { laporan_id: parseInt(id) },
  });
};
