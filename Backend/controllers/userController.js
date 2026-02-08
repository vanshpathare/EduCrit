const User = require("../models/User");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const validatePassword = require("../utils/validatePassword");
const { deleteUserAccount } = require("../services/accountService");
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete old avatar if exists
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    user.avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await user.save();

    res.status(200).json({
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

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.avatar?.public_id) {
      return res.status(400).json({
        message: "No avatar to delete",
      });
    }

    await deleteFromCloudinary(user.avatar.public_id);

    user.avatar = undefined;
    await user.save();

    res.status(200).json({
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

    if (!name && !institution) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) user.name = name.trim();
    if (institution) user.institution = institution.trim().toLowerCase();

    await user.save();

    const { password, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
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

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number and special character",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account permanently
 * @route   DELETE /api/users/account
 * @access  Private
 */
module.exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete account",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    //Correct & safest
    await deleteUserAccount(req.user._id);

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.updateWhatsapp = async (req, res, next) => {
  try {
    const { whatsapp } = req.body;

    // 1. Basic Validation
    if (!whatsapp) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Ensure it's a clean 10-digit number
    const cleanNumber = whatsapp.replace(/\D/g, ""); // Remove non-digits

    if (cleanNumber.length !== 10) {
      return res
        .status(400)
        .json({ message: "Please enter a valid 10-digit number" });
    }

    // 2. Update User in Database
    const user = await User.findByIdAndUpdate(
      req.user._id, // This comes from authMiddleware
      {
        whatsapp: {
          number: cleanNumber,
          isVerified: false, // Default to false until you manually verify them
        },
      },
      { new: true }, // Return the updated user
    );

    res.status(200).json({
      message: "Contact number updated successfully",
      whatsapp: user.whatsapp,
    });
  } catch (error) {
    next(error);
  }
};
