const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-_id name email")
      .populate("events", "-_id title");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or Password incorrect" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in user" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error changing password" });
  }
};

exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.params;

    const user = await User.findOne({ name })
      .select("-_id name email")
      .populate("events", "-_id title")
      .populate({
        path: "invitations",
        select: "-_id event status message",
        populate: {
          path: "event",
          select: "-_id title",
        },
      })
      .populate({
        path: "comments",
        select: "-_id event content",
        populate: {
          path: "event",
          select: "-_id title",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email })
    .select("-_id name email")
    .populate("events", "-_id title")
    .populate({
      path: "invitations",
      select: "-_id event status message",
      populate: {
        path: "event",
        select: "-_id title",
      },
    })
    .populate({
      path: "comments",
      select: "-_id event content",
      populate: {
        path: "event",
        select: "-_id title",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserByEmailAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = await User.findById(decoded.id);

    const { email } = req.params;
    const { name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else if (userId._id.toString() !== user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      user.name = name;
      user.password = hashedPassword;
      await user.save();
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.deleteUserByEmailAndToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = await User.findById(decoded.id);

    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else if (userId._id.toString() !== user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    } else if (user.events.length > 0) {
      res.status(500).json({
        error: "You have events, please delete them first",
      });
    } else {
      await user.deleteOne();
      res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
