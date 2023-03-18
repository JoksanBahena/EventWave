const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.getEvents);
router.post("/", eventController.createEvent);

router.get("/title/:title", eventController.getEventByName);
router.get("/location/:location", eventController.getEventByLocation);
router.get("/category/:category", eventController.getEventByCategory);
router.get("/date/:date", eventController.getEventByDate);
router.get("/organizer/:organizerName", eventController.getEventByOrganizer);
router.put("/update/:title", eventController.updateEventByNameAndToken);
router.delete("/delete/:title", eventController.deleteEventByNameAndToken);

module.exports = router;
