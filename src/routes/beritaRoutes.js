const express = require("express");
const router = express.Router();
const beritaController = require("../controllers/beritaController");
const validateBeritaInput = require("../middlewares/validateBeritaInput");
const upload = require("../middlewares/upload");

router.get("/beritas", beritaController.getAllBeritas);
router.get("/beritas/:id", beritaController.getBeritaById);
router.post(
  "/beritas",
  upload.single("photo"),
  validateBeritaInput,
  beritaController.createBerita
);
router.patch(
  "/beritas/:id",
  upload.single("photo"),
  beritaController.updateBerita
);
router.delete("/beritas/:id", beritaController.deleteBerita);

module.exports = router;
