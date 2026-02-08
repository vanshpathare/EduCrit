const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // No duplicates allowed
    uppercase: true, // Force uppercase automatically
    trim: true,
  },
});

module.exports = mongoose.model("Institute", instituteSchema);
