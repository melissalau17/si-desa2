const express = require("express");
const router = express.Router();
const suratController = require("../controllers/suratController");
const validateSuratInput = require("../middlewares/validateSuratInput");
const upload = require("../middlewares/upload");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/letters", authMiddleware, suratController.getAllSurat);
router.get("/letters/:id", authMiddleware, suratController.getSuratById);

router.post(
  "/letters",
  authMiddleware,
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
  ]),
  suratController.createSurat
);

router.patch(
  "/letters/:id",
  authMiddleware,
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
  ]),
  suratController.updateSurat
);

router.delete("/letters/:id", authMiddleware, suratController.deleteSurat);

module.exports = router;
