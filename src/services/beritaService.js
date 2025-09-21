const beritaModel = require("../models/beritaModel");
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.getAllBeritas = async () => {
  return await prisma.berita.findMany({
    include: {
      user: {
        select: { nama: true },
      },
    },
    orderBy: { tanggal: 'desc' }, // optional: biar terbaru dulu
  });
};

exports.getBeritaById = async (berita_id) => {
  return await prisma.berita.findUnique({
    where: { berita_id: parseInt(berita_id, 10) },
    include: {
      user: {
        select: { nama: true },
      },
    },
  });
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.getAllBeritas = async () => {
  return await prisma.berita.findMany({
    include: {
      user: {
        select: { nama: true },
      },
    },
    orderBy: { tanggal: 'desc' }, 
  });
};

exports.getBeritaById = async (berita_id) => {
  return await prisma.berita.findUnique({
    where: { berita_id: parseInt(berita_id, 10) },
    include: {
      user: {
        select: { nama: true },
      },
    },
  });
};

exports.createBerita = async (data) => {
  const { judul, kategori, photo_url, tanggal, kontent, status, user_id } = data;

  return await prisma.berita.create({
    data: {
      judul,
      kategori,
      tanggal,
      kontent,
      status,
      photo_url,
      user_id, 
    },
    include: {
      user: {
        select: { nama: true },
      },
    },
  });
};

exports.updateBerita = async (berita_id, data, photoUrl) => {
  const existing = await prisma.berita.findUnique({ where: { berita_id: parseInt(berita_id, 10) } });
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
      const oldKey = existing.photo_url.split('/').slice(4).join('/');
      await r2Client.send(new DeleteObjectCommand({ Bucket: 'sistemdesa', Key: oldKey }));
    }
    updateData.photo_url = photoUrl;
  } else if (data.photo_url === null && existing.photo_url) {
    const oldKey = existing.photo_url.split('/').slice(4).join('/');
    await r2Client.send(new DeleteObjectCommand({ Bucket: 'sistemdesa', Key: oldKey }));
    updateData.photo_url = null;
  }

  return await prisma.berita.update({
    where: { berita_id: parseInt(berita_id, 10) },
    data: updateData,
    include: {
      user: {
        select: { nama: true },
      },
    },
  });
};

exports.deleteBerita = async (berita_id) => {
  const berita = await prisma.berita.findUnique({ where: { berita_id: parseInt(berita_id, 10) } });
  if (!berita) return null;

  if (berita.photo_url) {
    const key = berita.photo_url.split('/').slice(4).join('/');
    await r2Client.send(new DeleteObjectCommand({ Bucket: 'sistemdesa', Key: key }));
  }

  return await prisma.berita.delete({ where: { berita_id: parseInt(berita_id, 10) } });
};