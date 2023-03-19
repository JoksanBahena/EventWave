const Invitation = require("../models/invitation");
const Event = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createInvitation = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const { eventName, inviteeNameOrEmail, status, message } = req.body;

    let event;
    let invitee;

    event = await Event.findOne({ title: eventName });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    invitee = await User.findOne({
      $or: [
        { name: inviteeNameOrEmail },
        { email: inviteeNameOrEmail }
      ]
    });

    if (!invitee) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkInvitation = await Invitation.findOne({ invitee: invitee._id, event: event._id });

    if (checkInvitation) {
      return res.status(400).json({ message: "You have invitation for this event" });
    }

    if (event.organizer == userId) {
      return res.status(401).json({ message: "You are the creator of the event, you enter for free" });
    }
    
    if (invitee._id != userId) {
      return res.status(401).json({ message: "Unauthorized to create invitation for another user" });
    }

    const invitation = await Invitation.create({
      event: event._id,
      invitee: invitee._id,
      status,
      message,
    });

    const updateEvent = await Event.findById(event);
    updateEvent.attendees.push(invitation);
    await updateEvent.save();

    const user = await User.findById(invitee);
    user.invitations.push(invitation);
    await user.save();

    res.status(201).json({ invitation });
  } catch (err) {
    res.status(500).json({ message: "Not created invitation" });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find()
    .populate("event", "title").populate("invitee", "name");

    res.status(200).json({ invitations });
  } catch (err) {
    res.status(500).json({ message: "Not found invitations" });
  }
};