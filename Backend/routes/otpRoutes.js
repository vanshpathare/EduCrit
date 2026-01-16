const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const otpRateLimiter = require("../middlewares/otpRateLimiter");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to phone number
 * @access  Private
 * @security Rate limited
 */
router.post("/send", authMiddleware, otpRateLimiter, sendOTP);

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 * @access  Private
 */
router.post("/verify", authMiddleware, verifyOTP);

module.exports = router;
