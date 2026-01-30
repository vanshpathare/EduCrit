const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const itemController = require("../controllers/itemController");

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
const { generalLimiter } = require("../middlewares/rateLimiter");

/**
 * PUBLIC ROUTES
 */

// Get all public listings
router.get("/", getAllItems);

/**
 * PRIVATE ROUTES (Login required)
 */

// Get logged-in user's listings ✅ MOVE UP
router.get("/my-listings/me", authMiddleware, getMyListings);

// Create new item
router.post(
  "/",
  generalLimiter,
  authMiddleware,
  upload.array("images", 4), // max 4 images
  createItem,
);

/**
 * DYNAMIC ROUTES (KEEP LAST)
 */

// Get single item by ID
router.get("/:id", getItemById);

// Update item
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 4),
  itemController.updateItem,
);

// Delete item
router.delete("/:id", authMiddleware, deleteItem);

// Update item images
router.put(
  "/:id/images",
  authMiddleware,
  upload.array("images", 4),
  updateItemImages,
);

module.exports = router;
