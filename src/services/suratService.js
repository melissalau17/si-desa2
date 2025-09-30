const suratModel = require("../models/SuratModel");
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

exports.getAllSurat = async () => {
  const surats = await suratModel.findAll({
    include: { user: true },
  });
  return surats.map(s => normalizeSuratPhotos(s));
};

exports.getSuratById = async (id) => {
  const surat = await suratModel.findById(id, {
    include: { user: true },
  });
  return normalizeSuratPhotos(surat);
};

exports.findByNIK = (nik) => suratModel.findByNIK(nik);

exports.createSurat = async (data) => {
  const newSurat = await suratModel.create(data);
  const created = await suratModel.findById(newSurat.surat_id, {
    include: { user: true },
  });
  return normalizeSuratPhotos(created);
};

exports.updateSurat = async (id, data) => {
  const existingSurat = await suratModel.findById(id);
  if (!existingSurat) return null;

  const updatedSurat = await suratModel.update(id, data);
  const suratId = updatedSurat.surat_id || id;

  const finalSurat = await suratModel.findById(suratId, { include: { user: true } });
  return normalizeSuratPhotos(finalSurat);
};

exports.deleteSurat = (id) => suratModel.remove(id);
