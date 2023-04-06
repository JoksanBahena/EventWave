const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);

router.post("/login", userController.loginUser);
router.get("/name/:name", userController.getUserByName);
router.get("/email/:email", userController.getUserByEmail);
router.put("/email/:email", userController.updateUserByEmailAndToken);
router.delete("/email/:email", userController.deleteUserByEmailAndToken);
router.patch("/password/changePassword", userController.changePassword);

module.exports = router;
