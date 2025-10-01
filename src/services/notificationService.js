const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.createNotification = async (data) => {
  return await prisma.notification.create({
    data: {
      title: data.title,
      body: data.body,
      type: data.type,
      userId: data.userId || null,
      suratId: data.suratId || null,
    },
  });
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
