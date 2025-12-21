const express = require("express");
const { register, profile } = require("../controllers/authController");
const { login } = require("../controllers/authController");
const { logout } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, profile);

module.exports = router;
