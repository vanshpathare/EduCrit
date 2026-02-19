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
  reactivateAccount,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const otpRateLimiter = require("../middlewares/otpRateLimiter");
const { authLimiter } = require("../middlewares/rateLimiter");
const { deleteAccount } = require("../controllers/userController");

// Auth ke liye
router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/logout", authLimiter, logout);

router.post("/reactivate", authLimiter, reactivateAccount);

// Profile ke liye
router.get("/me", authMiddleware, profile);
router.delete("/delete-account", authMiddleware, deleteAccount);

//  Forgot Password (OTP)
router.post("/forgot-password", otpRateLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/resend-verification-otp", otpRateLimiter, resendVerificationOTP);
router.post("/verify-email", verifyEmail);

module.exports = router;
