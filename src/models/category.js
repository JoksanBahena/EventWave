const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

module.exports = mongoose.model("Category", categorySchema);
