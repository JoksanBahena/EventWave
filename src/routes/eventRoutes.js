const express = require("express");
const router = express.Router();

const Event = require("../models/event");

router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", getEvent, (req, res) => {
  res.json(res.event);
});

router.post("/", async (req, res) => {
  const event = new Event({
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
    date: req.body.date,
    time: req.body.time,
    categories: req.body.categories,
    creator: req.body.creator,
    attendees: req.body.attendees,
    comments: req.body.comments,
  });
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", getEvent, async (req, res) => {
  if (req.body.name != null) {
    res.event.name = req.body.name;
  }
  if (req.body.description != null) {
    res.event.description = req.body.description;
  }
  if (req.body.location != null) {
    res.event.location = req.body.location;
  }
  if (req.body.date != null) {
    res.event.date = req.body.date;
  }
  if (req.body.time != null) {
    res.event.time = req.body.time;
  }
  if (req.body.categories != null) {
    res.event.categories = req.body.categories;
  }
  if (req.body.creator != null) {
    res.event.creator = req.body.creator;
  }
  if (req.body.attendees != null) {
    res.event.attendees = req.body.attendees;
  }
  if (req.body.comments != null) {
    res.event.comments = req.body.comments;
  }
  try {
    const updatedEvent = await res.event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", getEvent, async (req, res) => {
  try {
    await res.event.remove();
    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// async function getEvent(req, res, next) {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (event == null) {
//       return res.status(404).json({ message: "Evento no encontrado" });
//     }
//     res.event = event;
//     next();
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }

module.exports = router;
