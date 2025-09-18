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
    photo_url: photoUrl, 
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
    if (existingBerita.photo_url) {
      const oldPhotoKey = existingBerita.photo_url.split('/').slice(4).join('/');
      await r2Client.send(new DeleteObjectCommand({
        Bucket: 'sistemdesa',
        Key: oldPhotoKey
      }));
    }
    updateData.photo_url = photoUrl;
  } else if (data.photo_url === null) {
    if (existingBerita.photo_url) {
      const oldPhotoKey = existingBerita.photo_url.split('/').slice(4).join('/');
      await r2Client.send(new DeleteObjectCommand({
        Bucket: 'sistemdesa',
        Key: oldPhotoKey
      }));
    }
    updateData.photo_url = null;
  } else {
    updateData.photo_url = existingBerita.photo_url;
  }

  return beritaModel.update(berita_id, updateData);
};

exports.deleteBerita = async (berita_id) => {
  const berita = await beritaModel.findById(berita_id);
  if (!berita) return null;

  if (berita.photo_url) {
    const photoKey = berita.photo_url.split('/').slice(4).join('/');
    await r2Client.send(new DeleteObjectCommand({
      Bucket: 'sistemdesa',
      Key: photoKey
    }));
  }

  return beritaModel.remove(berita_id);
};