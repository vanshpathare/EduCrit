const mongoose = require("mongoose");

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
      select: false,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      url: String,
      public_id: String,
    },
    // For EMAIL VERIFICATION
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: {
      type: String,
    },

    emailVerificationOTPExpiry: {
      type: Date,
    },
    //For Forgot Password (OTP-based)
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpiry: {
      type: Date,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
    },
    whatsapp: {
      number: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },

    phoneOTP: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { isVerified: false },
  },
);

module.exports = mongoose.model("User", userSchema);
