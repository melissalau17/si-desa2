const express = require("express");
const router = express.Router();
const keuanganController = require("../controllers/keuanganController");
const validateKeuanganInput = require("../middlewares/validateKeuanganInput");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/finances", authMiddleware, keuanganController.getAllKeuangan);
router.get("/finances/:id", authMiddleware, keuanganController.getKeuanganById);
router.post(
  "/finances",
  authMiddleware,
  validateKeuanganInput,
  keuanganController.createKeuangan
);
router.patch(
  "/finances/:id",
  authMiddleware,
  keuanganController.updateKeuangan
);
router.delete(
  "/finances/:id",
  authMiddleware,
  keuanganController.deleteKeuangan
);

module.exports = router;
