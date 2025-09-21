const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLaporans = async () => {
    return await prisma.laporan.findMany({
        include: {
            user: {
                select: { no_hp: true, nama: true }
            }
        }
    });
};

exports.getLaporanById = async (id) => {
    return await prisma.laporan.findUnique({
        where: { laporan_id: parseInt(id) },
        include: {
            user: {
                select: { no_hp: true, nama: true }
            }
        }
    });
};

exports.createLaporan = async (data) => {
    const { keluhan, photo_url, tanggal, deskripsi, lokasi, vote, status, user_id } = data;

    return await prisma.laporan.create({
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
            user: {
                select: { nama: true, no_hp: true }
            }
        }
    });
};

exports.updateLaporan = async (id, data) => {
    const { photoUrl, ...updatePayload } = data;

    if (photoUrl) {
        updatePayload.photo = photoUrl;
    }

    return await prisma.laporan.update({
        where: { laporan_id: parseInt(id) },
        data: updatePayload,
    });
};

exports.deleteLaporan = async (id) => {
    const laporan = await prisma.laporan.findUnique({
        where: { laporan_id: parseInt(id) },
        select: { photo_url: true }
    });

    if (laporan && laporan.photo_url) {
        const photoUrl = laporan.photo_url;
        const urlParts = photoUrl.split('/');
        const key = urlParts.slice(4).join('/');

        await r2Client.send(new DeleteObjectCommand({
            Bucket: 'sistemdesa',
            Key: key
        }));
    }

    return await prisma.laporan.delete({
        where: { laporan_id: parseInt(id) },
    });
};
