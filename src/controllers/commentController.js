const Comment = require("../models/comment");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createComment = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const { eventName, userNameOrEmail, comment } = req.body;

    let event;
    let author;

    event = await Event.findOne({ title: eventName });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    author = await User.findOne({
      $or: [{ name: userNameOrEmail }, { email: userNameOrEmail }],
    });

    if (!author) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkComment = await Comment.findOne({
      author: author._id,
      event: event._id,
    });

    if (checkComment) {
      return res
        .status(400)
        .json({ message: "You have already commented on this event" });
    }

    if (author._id != userId) {
      return res.status(401).json({
        message: "Unauthorized to create comment for another user",
      });
    }

    const now = new Date();
    const formattedDate = now
      .toLocaleString("en-US", {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/[/]/g, "-")
      .replace(/[,]/g, " ");

    const newComment = await Comment.create({
      content: comment,
      author: author._id,
      event: event._id,
      createdAt: formattedDate,
    });

    const updateEvent = await Event.findById(event);
    updateEvent.comments.push(newComment._id);
    await updateEvent.save();

    const updateUser = await User.findById(author);
    updateUser.comments.push(newComment._id);
    await updateUser.save();

    res.status(201).json({ newComment });
  } catch (error) {
    res.status(500).json({ message: "Not created comment" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .select("-_id -__v")
      .populate("author", "-_id name")
      .populate("event", "-_id title");

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Not found comments" });
  }
};
