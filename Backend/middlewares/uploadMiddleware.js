const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const baseFolder = process.env.CLOUDINARY_BASE_FOLDER || "educrit/dev";
    const subFolder = req.uploadFolder || "items";

    return {
      folder: `${baseFolder}/${subFolder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 4,
  },
});

module.exports = upload;
