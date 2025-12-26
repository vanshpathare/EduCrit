const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

/**
 * @desc    Upload or update user avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
module.exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Avatar image is required",
      });
    }

    const user = await User.findById(req.user._id);

    // 🔥 Delete old avatar from Cloudinary (if exists)
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`educit/avatars/${publicId}`);
    }

    // Save new avatar URL
    user.avatar = req.file.path;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};
