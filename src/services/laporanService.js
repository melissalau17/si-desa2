const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const r2Client = require('../r2Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const normalizePhotoUrl = require('../utils/normalizePhotoUrl'); 

const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL;

exports.countAll = () => prisma.laporan.count();

exports.countNew = () => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.laporan.count({
        where: { createdAt: { gte: last7Days } },
    });
};

exports.getLatest = (limit = 5) =>
    prisma.laporan.findMany({
        include: { votes: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

exports.getAllLaporans = async () => {
    try {
        const laporans = await prisma.laporan.findMany({
            include: {
                votes: true,
                user: {
                    select: {
                        nama: true,
                        no_hp: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return laporans.map(l => ({
            ...l,
            photo_url: normalizePhotoUrl(l.photo_url),
        }));
    } catch (err) {
        console.error("Error fetching all laporans:", err);
        return [];
    }
};

exports.getLaporanById = async (id) => {
    try {
        const laporan = await prisma.laporan.findUnique({
            where: { laporan_id: parseInt(id) },
            include: {
                user: { 
                    select: {
                        nama: true,     
                        no_hp: true,    
                    }
                }
            },
        });
        if (!laporan) return null;

        return {
            ...laporan,
            photo_url: normalizePhotoUrl(laporan.photo_url),
            user: laporan.user, 
        };
    } catch (err) {
        console.error("Error fetching laporan by ID:", err);
        return null;
    }
};

exports.createLaporan = async (data) => {
    try {
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
                user: {
                    select: {
                        nama: true,  
                        no_hp: true,  
                    }
                }
            }
        });

        return { 
            ...newLaporan, 
            photo_url: normalizePhotoUrl(newLaporan.photo_url)
        };
    } catch (err) {
        console.error("Error creating laporan:", err);
        throw err;
    }
};

exports.updateLaporan = async (id, data) => {
    try {
        const { photoUrl, ...updatePayload } = data;

        if (photoUrl) updatePayload.photo_url = photoUrl;

        let updated = await prisma.laporan.update({
            where: { laporan_id: parseInt(id) },
            data: updatePayload,
        });

        if (updated.vote >= 50 && updated.status !== "siap dikerjakan") {
            updated = await prisma.laporan.update({
                where: { laporan_id: parseInt(id) },
                data: { status: "siap dikerjakan" },
            });
        }

        return { ...updated, photo_url: normalizePhotoUrl(updated.photo_url) };
    } catch (err) {
        console.error("Error updating laporan:", err);
        return null;
    }
};

exports.voteLaporan = async (laporanId, userId) => {
    try {
        const laporan = await prisma.laporan.findUnique({
            where: { laporan_id: parseInt(laporanId) },
            include: { votes: true },
        });
        if (!laporan) throw new Error("Laporan not found");

        const alreadyVoted = laporan.votes.some(v => v.userId === userId);
        if (alreadyVoted) throw new Error("User already voted");

        const updated = await prisma.laporan.update({
            where: { laporan_id: parseInt(laporanId) },
            data: {
                vote: { increment: 1 },
                votes: {
                    create: { userId },
                },
            },
            include: { votes: true },
        });

        return updated;
    } catch (err) {
        console.error("Error voting laporan:", err);
        throw err;
    }
};

exports.deleteLaporan = async (id) => {
    try {
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
    } catch (err) {
        console.error("Error deleting laporan:", err);
        return null;
    }
};
