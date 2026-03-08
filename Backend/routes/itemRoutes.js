const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const itemController = require("../controllers/itemController");
const { generalLimiter } = require("../middlewares/rateLimiter");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyListings,
  updateItemImages,
  getNearbyItems,
} = require("../controllers/itemController");

/**
 * PUBLIC ROUTES
 */

// Get all public listings
router.get("/", getAllItems);

router.get("/nearby", getNearbyItems);

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
router.put("/:id", authMiddleware, upload.array("images", 4), updateItem);

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
