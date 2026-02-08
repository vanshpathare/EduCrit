const mongoose = require("mongoose");

const otpAuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      enum: [
        "OTP_SENT",
        "OTP_VERIFIED",
        "OTP_FAILED",
        "OTP_EXPIRED",
        "OTP_BLOCKED",
      ],
      required: true,
    },
    reason: {
      type: String,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpAuditLog", otpAuditLogSchema);
