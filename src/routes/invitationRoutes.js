const express = require("express");
const router = express.Router();

const Invitation = require("../models/invitation");
const User = require("../models/user");
const Event = require("../models/event");

router.get("/", async (req, res) => {
  try {
    const invitations = await Invitation.find();
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", getInvitation, (req, res) => {
  res.json(res.invitation);
});

router.post("/", async (req, res) => {
  const invitation = new Invitation({
    user: req.body.user,
    event: req.body.event,
    status: req.body.status,
  });
  try {
    const newInvitation = await invitation.save();

    await User.findByIdAndUpdate(req.body.user, {
      $push: { invitations: newInvitation._id },
    });

    await Event.findByIdAndUpdate(req.body.event, {
      $push: { invitations: newInvitation._id },
    });

    res.status(201).json(newInvitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", getInvitation, async (req, res) => {
  if (req.body.status != null) {
    res.invitation.status = req.body.status;
  }
  try {
    const updatedInvitation = await res.invitation.save();
    res.json(updatedInvitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", getInvitation, async (req, res) => {
  try {
    await User.findByIdAndUpdate(res.invitation.user, {
      $pull: { invitations: res.invitation._id },
    });

    await Event.findByIdAndUpdate(res.invitation.event, {
      $pull: { invitations: res.invitation._id },
    });

    await res.invitation.remove();
    res.json({ message: "Invitación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// async function getInvitation(req, res, next) {
//   try {
//     const invitation = await Invitation.findById(req.params.id);
//     if (invitation == null) {
//       return res.status(404).json({ message: 'Invitación no encontrada' });
//     }
//     res.invitation = invitation;
//     next();
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }

module.exports = router;
