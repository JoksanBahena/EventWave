const Invitation = require("../models/invitation");

async function getInvitations(req, res) {
  try {
    const invitations = await Invitation.find();
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getInvitationById(req, res, next) {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (invitation == null) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }
    res.invitation = invitation;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function createInvitation(req, res) {
  const invitation = new Invitation({
    event: req.body.event,
    invitee: req.body.invitee,
    status: req.body.status,
    message: req.body.message,
  });
  try {
    const newInvitation = await invitation.save();
    res.status(201).json(newInvitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateInvitation(req, res) {
  if (req.body.event != null) {
    res.invitation.event = req.body.event;
  }
  if (req.body.invitee != null) {
    res.invitation.invitee = req.body.invitee;
  }
  if (req.body.status != null) {
    res.invitation.status = req.body.status;
  }
  if (req.body.message != null) {
    res.invitation.message = req.body.message;
  }
  try {
    const updatedInvitation = await res.invitation.save();
    res.json(updatedInvitation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteInvitation(req, res) {
  try {
    await res.invitation.remove();
    res.json({ message: "Invitación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getInvitations,
  getInvitationById,
  createInvitation,
  updateInvitation,
  deleteInvitation,
};
