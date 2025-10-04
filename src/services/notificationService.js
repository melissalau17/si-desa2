const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.createNotification = async (data, io) => {
  const notif = await prisma.notification.create({
    data: {
      title: data.title,
      body: data.body,
      user: { connect: { id: data.userId } },
      surat: { connect: { surat_id: data.suratId } },
    },
  });

  io.to(`user_${data.userId}`).emit("notification:new", notif);

  return notif;
};

exports.getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

exports.markAsRead = async (id) => {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};
