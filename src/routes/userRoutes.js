const express = require("express");
const router = express.Router();

const User = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", getUser, (req, res) => {
  res.json(res.user);
});

router.post("/", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    events: [],
    invitations: [],
    comments: [],
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// async function getUser(req, res, next) {
//   try {
//     const user = await User.findById(req.params.id);
//     if (user == null) {
//       return res.status(404).json({ message: "Usuario no encontrado" });
//     }
//     res.user = user;
//     next();
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }

module.exports = router;
