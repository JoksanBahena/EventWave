const Comment = require("../models/comment");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createCommentAndToken = async (req, res) => {
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

exports.updateCommentAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const { userNameOrEmail, eventName } = req.params;

    let author;
    let event;

    author = await User.findOne({
      $or: [{ name: userNameOrEmail }, { email: userNameOrEmail }],
    });

    if (!author) {
      return res.status(404).json({ message: "User not found" });
    }

    event = await Event.findOne({ title: eventName });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let comment;

    comment = await Comment.findOne({
      $and: [{ author: author._id }, { event: event._id }],
    }).populate("author event");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author._id != userId) {
      return res.status(401).json({
        message: "Unauthorized to update comment for another user",
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

    const { newContent } = req.body;

    beforeAuthor = await User.findOneAndUpdate(
      { _id: comment.author._id },
      { $pull: { comments: comment._id } }
    );

    beforeEvent = await Event.findOneAndUpdate(
      { _id: comment.event._id },
      { $pull: { comments: comment._id } }
    );

    comment.content = newContent;
    comment.createdAt = formattedDate;

    await comment.save();

    const userUpdate = await User.findById(comment.author);
    userUpdate.comments.push(comment._id);
    await userUpdate.save();

    const eventUpdate = await Event.findById(comment.event);
    eventUpdate.comments.push(comment._id);
    await eventUpdate.save();

    res.status(200).json({ comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCommentAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const { userNameOrEmail, eventName } = req.params;

    let author;
    let event;

    author = await User.findOne({
      $or: [{ name: userNameOrEmail }, { email: userNameOrEmail }],
    });

    if (!author) {
      return res.status(404).json({ message: "User not found" });
    }

    event = await Event.findOne({ title: eventName });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let comment;

    comment = await Comment.findOne({
      $and: [{ author: author._id }, { event: event._id }],
    }).populate("author event");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author._id != userId) {
      return res.status(401).json({
        message: "Unauthorized to delete comment for another user",
      });
    }

    deleteCommentInUser = await User.findOneAndUpdate(
      { _id: comment.author._id },
      { $pull: { comments: comment._id } }
    );

    deleteCommentInEvent = await Event.findOneAndUpdate(
      { _id: comment.event._id },
      { $pull: { comments: comment._id } }
    );

    await Comment.deleteOne();

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Not deleted comment" });
  }
};
