const Event = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      organizerNameOrEmail,
      attendees,
      category,
      comments,
    } = req.body;

    let organizer;

    organizer = await User.findOne({ name: organizerNameOrEmail });

    if (!organizer) {
      organizer = await User.findOne({ email: organizerNameOrEmail });
    }

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: organizer._id,
      attendees,
      category,
      comments,
    });

    const user = await User.findById(organizer);
    user.events.push(event);
    await user.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating event" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .select("title description date location category")
      .populate("organizer", "name");

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

exports.getEventByName = async (req, res) => {
  try {
    const { title } = req.params;

    const event = await Event.find({ title })
      .select("title description date location")
      .populate("organizer", "name")
      .populate("attendees", "name")
      .populate("category", "name");
    // .populate("comments", "content author createdAt");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const events = await Event.find({ location }).populate("organizer", "name");

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

exports.updateEventByNameAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret");
    const userId = decodedToken.id;

    const { title } = req.params;
    const event = await Event.findOne({ title });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== userId) {
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
