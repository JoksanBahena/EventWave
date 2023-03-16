const Event = require("../models/event");

async function getEvents(req, res) {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (event == null) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.event = event;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createEvent(req, res) {
  const event = new Event({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    organizer: req.body.organizer,
    attendees: req.body.attendees,
    category: req.body.category,
    comments: req.body.comments,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateEvent(req, res) {
  if (req.body.title != null) {
    res.event.title = req.body.title;
  }
  if (req.body.description != null) {
    res.event.description = req.body.description;
  }
  if (req.body.date != null) {
    res.event.date = req.body.date;
  }
  if (req.body.location != null) {
    res.event.location = req.body.location;
  }
  if (req.body.organizer != null) {
    res.event.organizer = req.body.organizer;
  }
  if (req.body.attendees != null) {
    res.event.attendees = req.body.attendees;
  }
  if (req.body.category != null) {
    res.event.category = req.body.category;
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
}

async function deleteEvent(req, res) {
  try {
    await res.event.remove();
    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getEventById,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
