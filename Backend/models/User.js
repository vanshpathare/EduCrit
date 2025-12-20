import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // do not return password by default
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String, // Cloudinary URL (optional)
      default: "",
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
