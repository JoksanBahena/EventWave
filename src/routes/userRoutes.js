const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.get("/name/:name", userController.getUserByName);
router.get("/email/:email", userController.getUserByEmail);
router.delete("/email/:email", userController.deleteUserByEmail);

module.exports = router;
