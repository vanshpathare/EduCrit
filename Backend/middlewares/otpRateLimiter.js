const rateLimit = require("express-rate-limit");

const otpRateLimiter = rateLimit({
  windowMs: 25 * 60 * 1000, // 25 minutes ke liye
  max: 5, // max 5 requests per window
  message: "Too many OTP requests. Please try again after 25 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = otpRateLimiter;
