const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  updateAvatar,
  deleteAvatar,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

router.put(
  "/avatar",
  authMiddleware,
  (req, res, next) => {
    req.uploadFolder = "educrit/avatars";
    next();
  },
  upload.single("avatar"),
  updateAvatar
);

router.delete("/avatar", authMiddleware, deleteAvatar);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
