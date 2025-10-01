const notificationService = require("../services/notificationService");
const { handleError } = require("../utils/errorHandler");

exports.createNotification = async (data) => {
  return await prisma.notification.create({
    data: {
      title: data.title,
      body: data.body,
      type: data.type,
      userId: data.userId,
      suratId: data.suratId,
    },
  });
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id; 
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await notificationService.markAsRead(Number(req.params.id));
    res.status(200).json({ message: "Notification marked as read", data: notif });
  } catch (error) {
    handleError(res, error);
  }
};
