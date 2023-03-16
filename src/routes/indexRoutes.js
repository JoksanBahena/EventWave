const express = require("express");
const router = express.Router();

const { eventController } = require("../controllers/indexController");
router.get("/events", eventController.getEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", eventController.createEvent);
router.put("/events/:id", eventController.updateEvent);
router.delete("/events/:id", eventController.deleteEvent);

const { userController } = require("../controllers/indexController");
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

const { invitationController } = require("../controllers/indexController");
router.get("/invitations", invitationController.getInvitations);
router.get("/invitations/:id", invitationController.getInvitationById);
router.post("/invitations", invitationController.createInvitation);
router.put("/invitations/:id", invitationController.updateInvitation);
router.delete("/invitations/:id", invitationController.deleteInvitation);

module.exports = router;
