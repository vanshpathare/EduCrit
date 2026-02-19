const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // The Renter/Buyer
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // The Owner/Seller
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },

    itemTitle: { type: String, required: true },
    itemImage: { type: String }, // Store the primary image URL

    amount: { type: Number, required: true }, // Ensure price is always locked in

    // Captured as a snapshot at the time of order
    deposit: String,

    transactionType: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    // OTP System
    pickupOTP: { code: String, isVerified: { type: Boolean, default: false } },
    returnOTP: { code: String, isVerified: { type: Boolean, default: false } },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
