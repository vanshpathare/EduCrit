const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { updateAvatar } = require("../controllers/userController");

router.put(
  "/avatar",
  authMiddleware,
  (req, res, next) => {
    req.uploadFolder = "educit/avatars";
    next();
  },
  upload.single("avatar"),
  updateAvatar
);

module.exports = router;
