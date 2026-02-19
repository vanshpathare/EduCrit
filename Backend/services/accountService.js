const User = require("../models/User");
const Item = require("../models/Item");

/**
 * SOFT DELETE user account
 * - Marks user as inactive
 * - Hides all items from marketplace
 * - Preserves transaction history for safety
 */
const deleteUserAccount = async (userId) => {
  // 1. Find user
  const user = await User.findById(userId);
  if (!user) return;

  // 2. Mark User as inactive (Soft Delete)
  user.isActive = false;
  user.deletedAt = new Date();
  await user.save();

  // 3. Hide all user's items from the public marketplace
  // We do NOT delete images from Cloudinary here because
  // they might be needed for Order History records.
  await Item.updateMany({ owner: userId }, { isAvailable: false });
};

module.exports = {
  deleteUserAccount,
};
