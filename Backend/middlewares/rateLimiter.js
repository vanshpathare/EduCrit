const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Try again later.",
});

exports.generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});

exports.accountDeleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many account deletion attempts. Please try later.",
});
