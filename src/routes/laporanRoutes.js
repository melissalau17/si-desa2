const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporanController");
const validateLaporanInput = require("../middlewares/validateLaporanInput");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/reports", authMiddleware, laporanController.getAllLaporans);
router.get("/reports/:id", authMiddleware, laporanController.getLaporanById);
router.post(
  "/reports",
  authMiddleware,
  upload.single("photo"),
  validateLaporanInput,
  laporanController.createLaporan
);
router.patch(
  "/reports/:id",
  authMiddleware,
  upload.single("photo"),
  laporanController.updateLaporan
);
router.delete("/reports/:id", authMiddleware, laporanController.deleteLaporan);

module.exports = router;
