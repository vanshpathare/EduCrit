const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  updateAvatar,
  deleteAvatar,
  updateProfile,
  changePassword,
  deleteAccount,
  updateWhatsapp,
} = require("../controllers/userController");
const { accountDeleteLimiter } = require("../middlewares/rateLimiter");

router.put(
  "/avatar",
  authMiddleware,
  (req, res, next) => {
    req.uploadFolder = "avatars";
    next();
  },
  upload.single("avatar"),
  updateAvatar,
);

router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/avatar", authMiddleware, deleteAvatar);
router.delete("/account", authMiddleware, accountDeleteLimiter, deleteAccount);
router.put("/whatsapp", authMiddleware, updateWhatsapp);

module.exports = router;
