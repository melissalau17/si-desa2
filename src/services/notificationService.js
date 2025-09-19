const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { io } = require('../index'); 

const sendPushNotification = async (tokens, payload) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: {
            title: payload.title,
            body: payload.body,
        },
        data: payload.data, 
        tokens: tokens,
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent push notifications:', response.successCount);
    } catch (error) {
        console.error('Error sending push notifications:', error);
    }
};

exports.sendNewBeritaNotification = async (berita) => {
    io.emit("notification", {
        title: "Berita Terbaru!",
        body: `Berita dengan judul "${berita.judul}" telah diterbitkan.`,
        time: berita.tanggal,
    });
    try {
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });
        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);
        const payload = {
            title: "Berita Terbaru!",
            body: `Berita dengan judul "${berita.judul}" telah diterbitkan.`,
            data: {
                beritaId: berita.berita_id.toString(),
            },
        };
        await sendPushNotification(fcmTokens, payload);
    } catch (error) {
        console.error("Failed to send new berita notification:", error);
    }
};

exports.sendUpdateBeritaNotification = async (berita) => {
    io.emit("notification", {
        title: "Berita Diperbarui!",
        body: `Berita dengan judul "${berita.judul}" telah diperbarui.`,
        time: new Date(),
    });
    try {
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });
        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);
        const payload = {
            title: "Berita Diperbarui!",
            body: `Berita dengan judul "${berita.judul}" telah diperbarui.`,
            data: {
                beritaId: berita.berita_id.toString(),
            },
        };
        await sendPushNotification(fcmTokens, payload);
    } catch (error) {
        console.error("Failed to send update berita notification:", error);
    }
};

exports.sendLaporanNotification = async (laporanData) => {
    io.emit("notification", {
        title: "Laporan Baru",
        body: `Laporan baru dari: ${laporanData.nama || 'Pengguna'}.`,
        time: new Date(),
    });

    try {
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });

        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);

        const payload = {
            title: "Pengajuan Laporan Baru",
            body: `Pengguna ${laporanData.nama || 'Pengguna'} telah membuat laporan baru.`,
            data: {
                laporanId: laporanData.laporan_id.toString(),
            },
        };
        
        await sendPushNotification(fcmTokens, payload);
    } catch (error) {
        console.error("Failed to send new laporan notification:", error);
    }
};

exports.sendLaporanStatusNotification = async (updatedLaporan) => {
    io.emit("notification", {
        title: "Status Laporan Diperbarui",
        body: `Status laporan Anda telah diperbarui menjadi: ${updatedLaporan.status}`,
        time: new Date(),
    });
    
    try {
        const laporanUser = await prisma.user.findUnique({
            where: { user_id: updatedLaporan.user_id },
            select: { fcmToken: true },
        });

        if (!laporanUser || !laporanUser.fcmToken) {
            console.log("No FCM token found for the user, skipping push notification.");
            return;
        }

        const fcmTokens = [laporanUser.fcmToken];

        const payload = {
            title: "Status Laporan Anda Diperbarui",
            body: `Status laporan Anda untuk ${updatedLaporan.keluhan} telah diperbarui menjadi: ${updatedLaporan.status}.`,
            data: {
                laporanId: updatedLaporan.laporan_id.toString(),
                status: updatedLaporan.status,
            },
        };

        await sendPushNotification(fcmTokens, payload);

    } catch (error) {
        console.error("Failed to send laporan status notification:", error);
    }
};

exports.sendSuratNotification = async (suratData) => {
    io.emit("notification", {
        title: "Surat Baru",
        body: `Surat baru dari: ${suratData.nama}.`,
        time: new Date(),
    });

    try {
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });

        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);

        const payload = {
            title: "Pengajuan Surat Baru",
            body: `Pengguna ${suratData.nama} telah mengajukan surat baru.`,
            data: {
                suratId: suratData.surat_id.toString(),
            },
        };

        await sendPushNotification(fcmTokens, payload);

    } catch (error) {
        console.error("Failed to send new surat notification:", error);
    }
};

exports.sendSuratStatusNotification = async (updatedSurat) => {
    io.emit("notification", {
        title: "Status Surat Diperbarui",
        body: `Status surat Anda telah diperbarui menjadi: ${updatedSurat.status}`,
        time: new Date(),
    });

    try {
        const suratUser = await prisma.user.findUnique({
            where: { user_id: updatedSurat.user_id },
            select: { fcmToken: true },
        });

        if (!suratUser || !suratUser.fcmToken) {
            console.log("No FCM token found for the user, skipping push notification.");
            return;
        }

        const fcmTokens = [suratUser.fcmToken];

        const payload = {
            title: "Status Surat Anda Diperbarui",
            body: `Status surat Anda untuk ${updatedSurat.jenis_surat} telah diperbarui menjadi: ${updatedSurat.status}.`,
            data: {
                suratId: updatedSurat.surat_id.toString(),
                status: updatedSurat.status,
            },
        };

        await sendPushNotification(fcmTokens, payload);

    } catch (error) {
        console.error("Failed to send surat status notification:", error);
    }
};

exports.sendUserRegistrationNotification = async (user, socket) => {
    if (socket) {
        socket.emit("notification", {
            title: "Pendaftaran User Baru",
            body: `User baru dengan nama ${user.nama} telah mendaftar.`,
            time: new Date(),
        });
    } else {
        console.error("Socket not available, skipping notification.");
    }

    try {
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });

        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);

        const payload = {
            title: "Pengguna Baru",
            body: `Pengguna ${user.nama} telah terdaftar sebagai ${user.role}.`,
            data: {
                userId: user.user_id.toString(),
            },
        };

        await sendPushNotification(fcmTokens, payload);
    } catch (error) {
        console.error("Failed to send new user notification:", error);
    }
};