const notificationService = require("../services/notificationService");
const { handleError } = require("../utils/errorHandler");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const notifications = await notificationService.getAllNotifications(userId);
    res.status(200).json({ data: notifications });
  } catch (error) {
    handleError(res, error);
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
