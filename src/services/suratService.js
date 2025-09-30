const { PrismaClient } = require("@prisma/client");
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
  const surats = await prisma.surat.findMany({
    include: { user: true },
    orderBy: { tanggal: "desc" },
  });
  return surats.map(normalizeSuratPhotos);
};

exports.getSuratById = async (id) => {
  const surat = await prisma.surat.findUnique({
    where: { surat_id: parseInt(id) },
    include: { user: true },
  });
  return normalizeSuratPhotos(surat);
};

exports.findByNIK = async (nik) => {
  return prisma.surat.findUnique({ where: { nik } });
};

exports.createSurat = async (data) => {
  const {
    nama,
    nik,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    agama,
    alamat,
    no_hp,
    email,
    jenis_surat,
    tujuan_surat,
    waktu_kematian,
    photo_ktp_url,
    photo_kk_url,
    tanggal,
    user_id, 
  } = data;

  if (!nama || !nik || !tempat_lahir || !tanggal_lahir || !jenis_kelamin || !agama || !alamat) {
    throw new Error("Semua field wajib diisi!");
  }

  const newSurat = await prisma.surat.create({
    data: {
      nama,
      nik,
      tempat_lahir,
      tanggal_lahir: new Date(tanggal_lahir),
      jenis_kelamin,
      agama,
      alamat,
      no_hp,
      email,
      jenis_surat,
      tujuan_surat,
      waktu_kematian: waktu_kematian ? new Date(waktu_kematian) : null,
      photo_ktp_url,
      photo_kk_url,
      tanggal: tanggal || new Date(),
      createdBy: user_id,
    },
  });

  const created = await prisma.surat.findUnique({
    where: { surat_id: newSurat.surat_id },
    include: { user: true },
  });

  return normalizeSuratPhotos(created);
};

exports.updateSurat = async (id, data) => {
  const existingSurat = await prisma.surat.findUnique({
    where: { surat_id: parseInt(id) },
  });

  if (!existingSurat) return null;

  const updatedSurat = await prisma.surat.update({
    where: { surat_id: parseInt(id) },
    data: data,
  });

  const finalSurat = await prisma.surat.findUnique({
    where: { surat_id: updatedSurat.surat_id },
    include: { user: true },
  });

  return normalizeSuratPhotos(finalSurat);
};

exports.deleteSurat = async (id) => {
  const surat = await prisma.surat.findUnique({ where: { surat_id: parseInt(id) } });
  if (!surat) return null;

  await prisma.surat.delete({ where: { surat_id: parseInt(id) } });
  return surat;
};
