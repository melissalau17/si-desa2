const express = require("express");
const router = express.Router();
const multer = require('multer');
const beritaController = require("../controllers/beritaController");
const validateBeritaInput = require("../middlewares/validateBeritaInput");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });
router.get("/beritas", authMiddleware, beritaController.getAllBeritas);
router.get("/beritas/:id", authMiddleware, beritaController.getBeritaById);
router.post(
  "/beritas",
  authMiddleware,
  upload.single("photo"),
  validateBeritaInput,
  beritaController.createBerita
);
router.patch(
  "/beritas/:id",
  authMiddleware,
  upload.single("photo"),
  beritaController.updateBerita
);
router.delete("/beritas/:id", authMiddleware, beritaController.deleteBerita);

module.exports = router;
