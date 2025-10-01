const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.post("/notifications/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;
