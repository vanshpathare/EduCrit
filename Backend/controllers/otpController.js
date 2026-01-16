const User = require("../models/User");
const { sendSMS } = require("../services/smsService");
const { logOtpEvent } = require("../services/otpAuditService");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * SEND OTP
 * POST /api/otp/send
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // E.164 format validation
    if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔒 Prevent resend if OTP still valid
    if (user.otp?.expiresAt > Date.now()) {
      await logOtpEvent({
        user: user._id,
        phone,
        event: "OTP_BLOCKED",
        reason: "OTP already active",
        req,
      });

      return res.status(400).json({
        message: "OTP already sent. Please wait before requesting again.",
      });
    }

    const otp = generateOTP();

    // Update whatsapp only if changed
    if (user.whatsapp?.number !== phone) {
      user.whatsapp = {
        number: phone,
        isVerified: false,
      };
    }

    user.otp = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      attempts: 0,
    };

    await user.save();

    await sendSMS({
      phone,
      message: `Your EduCrit OTP is ${otp}. Valid for 5 minutes.`,
    });

    // 🧾 AUDIT LOG — OTP SENT
    await logOtpEvent({
      user: user._id,
      phone,
      event: "OTP_SENT",
      req,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * VERIFY OTP
 * POST /api/otp/verify
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.otp?.code) {
      return res.status(400).json({ message: "OTP not found" });
    }

    const phone = user.whatsapp?.number;

    // 🚫 Too many attempts
    if (user.otp.attempts >= 3) {
      await logOtpEvent({
        user: user._id,
        phone,
        event: "OTP_BLOCKED",
        reason: "Max attempts exceeded",
        req,
      });

      return res.status(429).json({ message: "Too many attempts" });
    }

    // ⏰ OTP expired
    if (user.otp.expiresAt < Date.now()) {
      user.otp.attempts += 1;
      await user.save();

      await logOtpEvent({
        user: user._id,
        phone,
        event: "OTP_EXPIRED",
        req,
      });

      return res.status(400).json({ message: "OTP expired" });
    }

    // ❌ Wrong OTP
    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();

      await logOtpEvent({
        user: user._id,
        phone,
        event: "OTP_FAILED",
        reason: "Invalid OTP entered",
        req,
      });

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ VERIFIED
    user.whatsapp.isVerified = true;
    user.otp = undefined;

    await user.save();

    await logOtpEvent({
      user: user._id,
      phone,
      event: "OTP_VERIFIED",
      req,
    });

    res.json({ message: "Phone number verified successfully" });
  } catch (error) {
    next(error);
  }
};
