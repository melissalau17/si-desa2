const express = require("express");
const router = express.Router();
const multer = require('multer');

const userController = require("../controllers/userController");
const validateUserInput = require("../middlewares/validateUserInput");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });
router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);
router.post(
  "/users",
  authMiddleware,
  upload.single("photo"),
  validateUserInput,
  userController.createUser
);
router.patch(
  "/users/:id",
  authMiddleware,
  upload.single("photo"),
  userController.updateUser
);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

router.post("/login", userController.loginUser);

module.exports = router;
