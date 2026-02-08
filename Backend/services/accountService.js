const User = require("../models/User");
const Item = require("../models/Item");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

/**
 * HARD DELETE user account
 * - Deletes user avatar
 * - Deletes all item images
 * - Deletes all items
 * - Deletes user
 */
const deleteUserAccount = async (userId) => {
  // Find user
  const user = await User.findById(userId);
  if (!user) return;

  // Delete user avatar
  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  // Find user's items
  const items = await Item.find({ owner: userId });

  // Delete all item images
  for (const item of items) {
    for (const image of item.images) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  // Delete all items
  await Item.deleteMany({ owner: userId });

  // Delete user
  await User.deleteOne({ _id: userId });
};

module.exports = {
  deleteUserAccount,
};
