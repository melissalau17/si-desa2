const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const PUBLIC_URL = process.env.R2_PUBLIC_URL;

function normalizePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  return photoUrl.startsWith("http") ? photoUrl : `${PUBLIC_URL}/${photoUrl}`;
}

exports.getAllLaporans = async () => {
  const laporans = await prisma.laporan.findMany({
    include: {
      user: { select: { no_hp: true, nama: true } }
    }
  });
  return laporans.map(l => ({ ...l, photo_url: normalizePhotoUrl(l.photo_url) }));
};

exports.getLaporanById = async (id) => {
  const laporan = await prisma.laporan.findUnique({
    where: { laporan_id: parseInt(id) },
    include: {
      user: { select: { no_hp: true, nama: true } }
    }
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
      user_id,
    },
    include: {
      user: { select: { nama: true, no_hp: true } }
    }
  });

  return { ...newLaporan, photo_url: normalizePhotoUrl(newLaporan.photo_url) };
};

exports.updateLaporan = async (id, data) => {
  const { photoUrl, ...updatePayload } = data;

  if (photoUrl) {
    updatePayload.photo_url = photoUrl; // fix field name
  }

  const updated = await prisma.laporan.update({
    where: { laporan_id: parseInt(id) },
    data: updatePayload,
  });

  return { ...updated, photo_url: normalizePhotoUrl(updated.photo_url) };
};

exports.deleteLaporan = async (id) => {
  const laporan = await prisma.laporan.findUnique({
    where: { laporan_id: parseInt(id) },
    select: { photo_url: true }
  });

  if (laporan && laporan.photo_url) {
    const oldKey = laporan.photo_url.replace(`${PUBLIC_URL}/`, "");
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldKey
    }));
  }

  return await prisma.laporan.delete({
    where: { laporan_id: parseInt(id) },
  });
};