const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    videoLink: {
      type: String,
      trim: true,
      required: false, // Optional
    },

    // SELL OPTION
    sell: {
      enabled: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
      },
    },

    // RENT OPTION
    rent: {
      enabled: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
      },
      period: {
        type: String,
        enum: ["hour", "day", "week", "month"],
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// 🔐 Ensure at least one option is enabled
itemSchema.pre("save", async function () {
  if (!this.sell.enabled && !this.rent.enabled) {
    throw new Error("Item must be available for sell or rent (or both)");
  }
});

module.exports = mongoose.model("Item", itemSchema);
