const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reporterSnapshot: {
    name: String,
    phoneNumber: String,
  },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  reason: { type: String, required: true, minlength: 10 },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
