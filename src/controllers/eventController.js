const Event = require("../models/event");

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      organizer: req.user.id,
      category: req.body.category,
    });

    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating event" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("category");

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("category")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email",
        },
      });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update event" });
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.location = req.body.location || event.location;
    event.category = req.body.category || event.category;

    await event.save();

    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete event" });
    }

    await event.remove();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting event" });
  }
};

// Método para buscar eventos por nombre
exports.searchByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    const events = await Event.find(
      { title: { $regex: name, $options: "i" } },
      "title description date location organizer category comments"
    )
      .populate("organizer", "name")
      .populate("category", "name");
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
};

// Método para buscar eventos por lugar
exports.searchByLocation = async (req, res, next) => {
  try {
    const { location } = req.query;
    const events = await Event.find(
      { location: { $regex: location, $options: "i" } },
      "title description date location organizer category comments"
    )
      .populate("organizer", "name")
      .populate("category", "name");
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
};

// Método para buscar eventos por categoría
exports.searchByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const events = await Event.find(
      { category },
      "title description date location organizer category comments"
    )
      .populate("organizer", "name")
      .populate("category", "name");
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
};

// Método para buscar eventos por fecha
exports.searchByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    const events = await Event.find(
      { date },
      "title description date location organizer category comments"
    )
      .populate("organizer", "name")
      .populate("category", "name");
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
};

// Método para buscar eventos por organizador
exports.searchByOrganizer = async (req, res, next) => {
  try {
    const { organizer } = req.query;
    const events = await Event.find(
      { organizer },
      "title description date location organizer category comments"
    )
      .populate("organizer", "name")
      .populate("category", "name");
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
};
