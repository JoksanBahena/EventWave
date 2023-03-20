const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createEventAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const {
      title,
      description,
      date,
      location,
      organizerNameOrEmail,
      attendees,
      categoryName,
      comments,
    } = req.body;

    const checkEvent = await Event.findOne({ title });

    if (checkEvent) {
      return res.status(400).json({ message: "Event already exists" });
    }

    let organizer;
    organizer = await User.findOne({
      $or: [{ name: organizerNameOrEmail }, { email: organizerNameOrEmail }],
    });

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    if (organizer._id != userId) {
      return res.status(401).json({ message: "Unauthorized to created event" });
    }

    let categoryEvent;
    categoryEvent = await Category.findOne({ name: categoryName });

    if (!categoryEvent) {
      categoryEvent = await Category.create({ name: categoryName });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: organizer._id,
      attendees,
      category: categoryEvent._id,
      comments,
    });

    const category = await Category.findById(categoryEvent);
    category.events.push(event);
    await category.save();

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
      .select("title description date location organizer category")
      .populate("organizer", "name email")
      .populate("category", "name");
    // .populate({
    //   path: "attendees",
    //   select: "invitee status message",
    //   populate: {
    //     path: "invitee",
    //     select: "name email",
    //   },
    // });

    res.json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting events" });
  }
};

exports.getEventByName = async (req, res) => {
  try {
    const { title } = req.params;

    const event = await Event.find({ title })
      .populate("organizer", "name email")
      .populate("category", "name")
      .populate({
        path: "attendees",
        select: "invitee status message",
        populate: {
          path: "invitee",
          select: "name email",
        },
      });

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
    const events = await Event.find({ location })
      .populate("organizer", "name")
      .populate("category", "name")
      .populate({
        path: "attendees",
        select: "invitee status message",
        populate: {
          path: "invitee",
          select: "name email",
        },
      });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const categoryId = await Category.findOne({ name: category });

    const events = await Event.find({ category: categoryId._id })
      .populate("organizer", "name email")
      .populate("category", "name")
      .populate({
        path: "attendees",
        select: "invitee status message",
        populate: {
          path: "invitee",
          select: "name email",
        },
      });

    res.status(200).json({ events });
  } catch (err) {
    res.status(500).json({ error: "No events found with the category" });
  }
};

exports.getEventByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const events = await Event.find({
      date: {
        $gte: new Date(date),
        $lt: new Date(date).setDate(new Date(date).getDate() + 1),
      },
    })
      .populate("organizer", "name email")
      .populate("category", "name")
      .populate({
        path: "attendees",
        select: "invitee status message",
        populate: {
          path: "invitee",
          select: "name email",
        },
      });

    if (!events) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "No events found with at date" });
  }
};

exports.getEventByOrganizer = async (req, res) => {
  try {
    const { organizerName } = req.params;

    const user = await User.findOne({ name: organizerName });

    const userId = user._id;

    const events = await Event.find({ organizer: userId })
      .populate("organizer", "name email")
      .populate("category", "name")
      .populate({
        path: "attendees",
        select: "invitee status message",
        populate: {
          path: "invitee",
          select: "name email",
        },
      });

    res.status(200).json({ events });
  } catch (err) {
    res.status(500).json({ error: "No events found with the organizer name" });
  }
};

exports.updateEventByNameAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
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

    let category;

    const {
      title: newTitle,
      description,
      date,
      location,
      attendees,
      categoryName,
      comments,
    } = req.body;

    beforeCategory = await Category.findOneAndUpdate(
      { _id: event.category },
      {
        $pull: { events: event._id },
      }
    );
    category = await Category.findOne({ name: categoryName });

    if (!category) {
      category = await Category.create({ name: categoryName });
    }

    event.title = newTitle;
    event.description = description;
    event.date = date;
    event.location = location;
    event.attendees = attendees;
    event.category = category._id;
    event.comments = comments;

    await event.save();

    const categoryUpdate = await Category.findById(category);
    categoryUpdate.events.push(event);
    await categoryUpdate.save();

    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating event" });
  }
};

exports.deleteEventByNameAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const { title } = req.params;
    const event = await Event.findOne({ title });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
