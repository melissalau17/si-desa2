const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUserInput = require("../middlewares/validateUserInput");
const upload = require("../middlewares/upload");

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.post(
  "/users",
  upload.single("photo"),
  validateUserInput,
  userController.createUser
);
router.patch("/users/:id", upload.single("photo"), userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
