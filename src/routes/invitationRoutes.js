const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");

router.get("/", invitationController.getInvitations);
router.post("/", invitationController.createInvitation);

module.exports = router;