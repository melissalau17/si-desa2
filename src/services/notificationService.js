const { prisma } = require("../utils/prisma");

exports.createNotification = async (data) => {
  return await prisma.notification.create({ data });
};

exports.getAllNotifications = async (userId) => {
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
