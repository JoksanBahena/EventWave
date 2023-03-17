const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

router.get("/name/:name", eventController.searchByName);
router.get("/location/:location", eventController.searchByLocation);
router.get("/category/:categoryId", eventController.searchByCategory);
router.get("/date/:date", eventController.searchByDate);
router.get("/organizer/:organizerId", eventController.searchByOrganizer);

module.exports = router;
