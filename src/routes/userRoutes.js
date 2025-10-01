const express = require("express");
const router = express.Router();
const multer = require('multer');

const userController = require("../controllers/userController");
const validateUserInput = require("../middlewares/validateUserInput");
const authMiddleware = require("../middlewares/authMiddleware");
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/users",
  userController.uploadPhoto,
  validateUserInput,
  userController.createUser
);
router.post("/login", userController.loginUser);

router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);
router.patch(
  "/users/:id",
  authMiddleware,
  upload.single("photo"),
  userController.updateUser
);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

module.exports = router;