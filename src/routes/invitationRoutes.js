const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");

router.get("/", invitationController.getInvitations);
router.post("/", invitationController.createInvitationAndToken);
router.put("/update/:inviteeNameOrEmail", invitationController.updateInvitationAndToken);

module.exports = router;