const beritaModel = require("../models/beritaModel");
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.getAllBeritas = () => beritaModel.findAll();

exports.getBeritaById = (berita_id) => beritaModel.findById(berita_id);

exports.createBerita = async (data) => {
  const { judul, kategori, photoUrl, tanggal, kontent, status } = data;

  return beritaModel.create({
    judul,
    kategori,
    tanggal,
    kontent,
    status,
    photo: photoUrl, 
  });
};

exports.updateBerita = async (berita_id, data, photoUrl) => {
  const existingBerita = await beritaModel.findById(berita_id);
  if (!existingBerita) return null;

  const updateData = {
    judul: data.judul,
    kategori: data.kategori,
    tanggal: data.tanggal,
    kontent: data.kontent,
    status: data.status,
  };

  if (photoUrl) {
    if (existingBerita.photo) {
      const oldPhotoKey = existingBerita.photo.split('/').slice(4).join('/');
      await r2Client.send(new DeleteObjectCommand({
        Bucket: 'sistemdesa',
        Key: oldPhotoKey
      }));
    }
    updateData.photo = photoUrl;
  } else if (data.photo === null) {
    if (existingBerita.photo) {
      const oldPhotoKey = existingBerita.photo.split('/').slice(4).join('/');
      await r2Client.send(new DeleteObjectCommand({
        Bucket: 'sistemdesa',
        Key: oldPhotoKey
      }));
    }
    updateData.photo = null;
  } else {
    updateData.photo = existingBerita.photo;
  }

  return beritaModel.update(berita_id, updateData);
};

exports.deleteBerita = async (berita_id) => {
  const berita = await beritaModel.findById(berita_id);
  if (!berita) return null;

  if (berita.photo) {
    const photoKey = berita.photo.split('/').slice(4).join('/');
    await r2Client.send(new DeleteObjectCommand({
      Bucket: 'sistemdesa',
      Key: photoKey
    }));
  }

  return beritaModel.remove(berita_id);
};