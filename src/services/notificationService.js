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

exports.sendBeritaNotification = async (berita) => {
    io.emit("notification", {
        title: "Berita Terbaru!",
        message: `Berita dengan judul "${berita.judul}" telah diterbitkan atau diperbarui.`,
        time: berita.tanggal,
    });

    try {
        const adminUsers = await db.user.findMany({
            where: { role: "admin" },
        });

        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);

        const payload = {
            title: "Berita Terbaru!",
            body: `Berita dengan judul "${berita.judul}" telah diterbitkan atau diperbarui.`,
            data: {
                beritaId: berita.berita_id.toString(),
            },
        };

        await sendPushNotification(fcmTokens, payload);
    } catch (error) {
        console.error("Failed to send mobile notifications:", error);
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