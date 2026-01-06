// const User = require("../models/User");
// const cloudinary = require("../config/cloudinary");

// /**
//  * @desc    Upload or update user avatar
//  * @route   PUT /api/users/avatar
//  * @access  Private
//  */
// module.exports.updateAvatar = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         message: "Avatar image is required",
//       });
//     }

//     const user = await User.findById(req.user._id);

//     // 🔥 Delete old avatar from Cloudinary (if exists)
//     if (user.avatar) {
//       const publicId = user.avatar.split("/").pop().split(".")[0];
//       await cloudinary.uploader.destroy(`educit/avatars/${publicId}`);
//     }

//     // Save new avatar URL
//     user.avatar = req.file.path;
//     await user.save();

//     res.json({
//       message: "Avatar updated successfully",
//       avatar: user.avatar,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const User = require("../models/User");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const bcrypt = require("bcryptjs");

/**
 * @desc    Upload / Replace avatar
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

    // Delete old avatar if exists
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    user.avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await user.save();

    res.json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete avatar
 * @route   DELETE /api/users/avatar
 * @access  Private
 */
module.exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.avatar?.public_id) {
      return res.status(400).json({
        message: "No avatar to delete",
      });
    }

    await deleteFromCloudinary(user.avatar.public_id);

    user.avatar = undefined;
    await user.save();

    res.json({
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete avatar
 * @route   DELETE /api/users/avatar
 * @access  Private
 */
module.exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.avatar?.public_id) {
      return res.status(400).json({
        message: "No avatar to delete",
      });
    }

    await deleteFromCloudinary(user.avatar.public_id);

    user.avatar = undefined;
    await user.save();

    res.json({
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile info
 * @route   PUT /api/users/profile
 * @access  Private
 */
module.exports.updateProfile = async (req, res, next) => {
  try {
    const { name, institution } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (institution) user.institution = institution;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
module.exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
