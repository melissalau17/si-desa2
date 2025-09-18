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
        const adminUsers = await prisma.user.findMany({
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

exports.sendSuratNotification = async (suratData) => {
    // 1. Emit a real-time notification via Socket.IO
    io.emit("notification", {
        title: "Surat Baru",
        body: `Surat baru dari: ${suratData.nama}.`,
        time: new Date(),
    });

    try {
        // 2. Find all admin users to send a push notification
        const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { fcmToken: true },
        });

        // 3. Collect all valid FCM tokens
        const fcmTokens = adminUsers
            .map((user) => user.fcmToken)
            .filter(Boolean);

        // 4. Construct the push notification payload
        const payload = {
            title: "Pengajuan Surat Baru",
            body: `Pengguna ${suratData.nama} telah mengajukan surat baru.`,
            data: {
                suratId: suratData.surat_id.toString(),
            },
        };
        
        // 5. Send the push notification
        await sendPushNotification(fcmTokens, payload);

    } catch (error) {
        console.error("Failed to send new surat notification:", error);
    }
};

exports.sendSuratStatusNotification = async (updatedSurat) => {
    // 1. Emit a real-time notification via Socket.IO
    io.emit("notification", {
        title: "Status Surat Diperbarui",
        body: `Status surat Anda telah diperbarui menjadi: ${updatedSurat.status}`,
        time: new Date(),
    });
    
    try {
        // 2. Find the user who submitted the letter
        const suratUser = await prisma.user.findUnique({
            where: { user_id: updatedSurat.user_id },
            select: { fcmToken: true },
        });

        // 3. Collect the user's FCM token
        if (!suratUser || !suratUser.fcmToken) {
            console.log("No FCM token found for the user, skipping push notification.");
            return;
        }

        const fcmTokens = [suratUser.fcmToken];

        // 4. Construct the push notification payload
        const payload = {
            title: "Status Surat Anda Diperbarui",
            body: `Status surat Anda untuk ${updatedSurat.jenis_surat} telah diperbarui menjadi: ${updatedSurat.status}.`,
            data: {
                suratId: updatedSurat.surat_id.toString(),
                status: updatedSurat.status,
            },
        };

        // 5. Send the push notification
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
        // Find all admin users
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