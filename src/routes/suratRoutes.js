const express = require("express");
const router = express.Router();
const multer = require('multer');

const suratController = require("../controllers/suratController");
const validateSuratInput = require("../middlewares/validateSuratInput");
const authMiddleware = require("../middlewares/authMiddleware");

// Use a single, correctly configured upload middleware
const upload = multer({ storage: multer.memoryStorage() });

router.get("/letters", authMiddleware, suratController.getAllSurat);

router.get("/letters/:id", authMiddleware, suratController.getSuratById);

router.post(
  "/letters",
  authMiddleware,
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
    { name: "foto_usaha", maxCount: 1 },
    { name: "gaji_ortu", maxCount: 1 },
  ]),
  validateSuratInput,
  suratController.createSurat
);

router.patch(
  "/letters/:id",
  authMiddleware,
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
    { name: "foto_usaha", maxCount: 1 },
    { name: "gaji_ortu", maxCount: 1 },
  ]),
  suratController.updateSurat
);

router.delete("/letters/:id", authMiddleware, suratController.deleteSurat);

router.get("/letters/:id/print", (req, res, next) => {
  console.log("masuk ke /letters/:id/print", req.params);
  next();
}, authMiddleware, suratController.printSurat);

module.exports = router;