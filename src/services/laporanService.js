const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Buffer } = require("buffer");

const convertBase64ToBinary = (base64String) => {
  return Buffer.from(base64String, "base64");
};

exports.getAllLaporans = async () => {
  return await prisma.laporan.findMany({
    include: {
      user: {
        select: {
          no_hp: true,
          nama: true,
        },
      },
    },
  });
};

exports.getLaporanById = async (id) => {
  return await prisma.laporan.findUnique({
    where: { laporan_id: parseInt(id) },
    include: {
      user: {
        select: {
          no_hp: true,
          nama: true,
        },
      },
    },
  });
};

exports.createLaporan = async (data) => {
  const { nama, keluhan, photo, tanggal, deskripsi, lokasi, vote, status, user_id } = data;

  let photoBuffer = null;
  if (photo) {
    photoBuffer = photo.includes("base64") 
      ? convertBase64ToBinary(photo.split(",")[1])
      : photo;
  }

  return await prisma.laporan.create({
    data: {
      nama,
      keluhan,
      tanggal,
      deskripsi,
      lokasi,
      vote: vote || 0,
      status,
      photo: photoBuffer,
      user_id, 
    },
  });
};

exports.updateLaporan = async (id, data, base64Photo) => {
  const updateData = {
    nama: data.nama,
    keluhan: data.keluhan,
    tanggal: data.tanggal,
    deskripsi: data.deskripsi,
    lokasi: data.lokasi,
    vote: data.vote,
    status: data.status,
  };

  if (base64Photo) {
    updateData.photo = convertBase64ToBinary(base64Photo);
  }

  return await prisma.laporan.update({
    where: { laporan_id: parseInt(id) },
    data: updateData,
  });
};

exports.deleteLaporan = async (id) => {
  return await prisma.laporan.delete({
    where: { laporan_id: parseInt(id) },
  });
};
