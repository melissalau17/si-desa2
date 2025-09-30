const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);

module.exports = router;