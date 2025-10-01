const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const { title, body, type, userId, suratId } = req.body;
      const notif = await notificationController.createNotification({
        title, body, type, userId, suratId
      });
      res.status(201).json(notif);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification", error: error.message });
    }
  }
);

router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.post("/notifications/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
