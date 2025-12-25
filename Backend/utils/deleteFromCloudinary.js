const cloudinary = require("../config/cloudinary");

const deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return;

    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
  }
};

module.exports = deleteFromCloudinary;
