const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  profile,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const otpRateLimiter = require("../middlewares/otpRateLimiter");

// Auth ke liye
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Profile ke liye
router.get("/me", authMiddleware, profile);

//  Forgot Password (OTP)
router.post("/forgot-password", otpRateLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/resend-verification-otp", otpRateLimiter, resendVerificationOTP);
router.post("/verify-email", verifyEmail);

module.exports = router;
