const express = require("express");
const router = express.Router();
const suratController = require("../controllers/suratController");
const validateSuratInput = require("../middlewares/validateSuratInput");
const upload = require("../middlewares/upload");

router.get("/letters", suratController.getAllSurat);
router.get("/letters/:id", suratController.getSuratById);

router.post(
  "/letters",
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
  ]),
  suratController.createSurat
);

router.patch(
  "/letters/:id",
  upload.fields([
    { name: "photo_ktp", maxCount: 1 },
    { name: "photo_kk", maxCount: 1 },
  ]),
  suratController.updateSurat
);

router.delete("/letters/:id", suratController.deleteSurat);

module.exports = router;
