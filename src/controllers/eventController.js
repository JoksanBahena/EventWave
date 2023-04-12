const Event = require("../models/event");
const User = require("../models/user");
const Category = require("../models/category");
const Invitation = require("../models/invitation");
const Comment = require("../models/comment");
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
      categoryName,
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
      category: categoryEvent._id,
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
      .select("-_id title description date location organizer category")
      .populate("organizer", "-_id name email")
      .populate("category", "-_id name");

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
      .select("-_id -__v")
      .populate("organizer", "-_id name email")
      .populate("category", "-_id name")
      .populate({
        path: "attendees",
        select: "-_id invitee status message",
        populate: {
          path: "invitee",
          select: "-_id name email",
        },
      })
      .populate({
        path: "comments",
        select: "-_id content author",
        populate: {
          path: "author",
          select: "-_id name email",
        },
      });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "No events found with thats name" });
  }
};

exports.getEventByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const events = await Event.find({ location })
      .select("-_id -__v")
      .populate("organizer", "-_id name")
      .populate("category", "-_id name")
      .populate({
        path: "attendees",
        select: "-_id invitee status message",
        populate: {
          path: "invitee",
          select: "-_id name email",
        },
      })
      .populate({
        path: "comments",
        select: "-_id content author",
        populate: {
          path: "author",
          select: "-_id name email",
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
      .select("-_id -__v")
      .populate("organizer", "-_id name email")
      .populate("category", "-_id name")
      .populate({
        path: "attendees",
        select: "-_id invitee status message",
        populate: {
          path: "invitee",
          select: "-_id name email",
        },
      })
      .populate({
        path: "comments",
        select: "-_id content author",
        populate: {
          path: "author",
          select: "-_id name email",
        },
      });

    res.status(200).json({ events });
  } catch (err) {
    res.status(500).json({ error: "No events found with the category" });
  }
};

exports.getEventByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const events = await Event.find({ date })
      .select("-_id -__v")
      .populate("organizer", "-_id name email")
      .populate("category", "-_id name")
      .populate({
        path: "attendees",
        select: "-_id invitee status message",
        populate: {
          path: "invitee",
          select: "-_id name email",
        },
      })
      .populate({
        path: "comments",
        select: "-_id content author",
        populate: {
          path: "author",
          select: "-_id name email",
        },
      });

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
      .select("-_id -__v")
      .populate("organizer", "-_id name email")
      .populate("category", "-_id name")
      .populate({
        path: "attendees",
        select: "-_id invitee status message",
        populate: {
          path: "invitee",
          select: "-_id name email",
        },
      })
      .populate({
        path: "comments",
        select: "-_id content author",
        populate: {
          path: "author",
          select: "-_id name email",
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

    deleteEventInUser = await User.findOneAndUpdate(
      { _id: event.organizer },
      {
        $pull: { events: event._id },
      }
    );

    deleteEventInCategory = await Category.findOneAndUpdate(
      { _id: event.category },
      {
        $pull: { events: event._id },
      }
    );

    deleteInvitationsInUser = await User.updateMany(
      { invitations: { $in: event.attendees } },
      {
        $pull: { invitations: { $in: event.attendees } },
      }
    );

    deleteComments = await User.updateMany(
      { comments: { $in: event.comments } },
      {
        $pull: { comments: { $in: event.comments } },
      }
    );

    deleteInvitations = await Invitation.deleteMany({
      event: event._id,
    });

    deleteComments = await Comment.deleteMany({
      event: event._id,
    });

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
