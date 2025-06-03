const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUserInput = require("../middlewares/validateUserInput");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/users", authMiddleware, userController.getAllUsers);
router.get("/users/:id", authMiddleware, userController.getUserById);
router.post(
  "/users",
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
