const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        password: hashedPassword,
      },
      { new: true }
    ).populate("events");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name }).select(
      "name email events invitations comments"
    );
    console.log(name);
    console.log(user);
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
    const user = await User.findOne({ email }).select(
      "name email events invitations comments"
    );
    console.log(email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.deleteUserByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const user = await User.findOne({ email });
//     console.log(email);
//     console.log(user);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

exports.deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndDelete({ email });
    console.log(req.params.email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
