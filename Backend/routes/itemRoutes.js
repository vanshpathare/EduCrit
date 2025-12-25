const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyListings,
  updateItemImages,
} = require("../controllers/itemController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * PUBLIC ROUTES
 */

// Get all public listings
router.get("/", getAllItems);

// Get single item by ID
router.get("/:id", getItemById);

/**
 * PRIVATE ROUTES (Login required)
 */

// Create new item
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5), // 🔥 THIS WAS MISSING
  createItem
);

// Get logged-in user's listings
router.get("/my-listings/me", authMiddleware, getMyListings);

// Update item (owner only)
router.put("/:id", authMiddleware, updateItem);

// Soft delete item (owner only)
router.delete("/:id", authMiddleware, deleteItem);

router.put(
  "/:id/images",
  authMiddleware,
  upload.array("images", 5),
  updateItemImages
);

module.exports = router;
