const express = require("express");
const router = express.Router();
const keuanganController = require("../controllers/keuanganController");
const validateKeuanganInput = require("../middlewares/validateKeuanganInput");

router.get("/finances", keuanganController.getAllKeuangan);
router.get("/finances/:id", keuanganController.getKeuanganById);
router.post(
  "/finances",
  validateKeuanganInput,
  keuanganController.createKeuangan
);
router.patch("/finances/:id", keuanganController.updateKeuangan);
router.delete("/finances/:id", keuanganController.deleteKeuangan);

module.exports = router;
