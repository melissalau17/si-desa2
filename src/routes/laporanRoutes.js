const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporanController");
const validateLaporanInput = require("../middlewares/validateLaporanInput");
const upload = require("../middlewares/upload");

router.get("/reports", laporanController.getAllLaporans);
router.get("/reports/:id", laporanController.getLaporanById);
router.post(
  "/reports",
  upload.single("photo"),
  validateLaporanInput,
  laporanController.createLaporan
);
router.patch(
  "/reports/:id",
  upload.single("photo"),
  laporanController.updateLaporan
);
router.delete("/reports/:id", laporanController.deleteLaporan);

module.exports = router;
