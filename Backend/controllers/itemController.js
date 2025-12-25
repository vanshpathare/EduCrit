const Item = require("../models/Item");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private
 */
module.exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, sell, rent } = req.body;

    // 🔒 At least 1 image required
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    // 🔒 Maximum 4 images allowed
    if (req.files.length > 4) {
      return res.status(400).json({
        message: "You can upload a maximum of 4 images",
      });
    }

    // 🧠 Safe JSON parsing for sell & rent
    let sellData = { enabled: false };
    let rentData = { enabled: false };

    try {
      if (sell) sellData = JSON.parse(sell);
      if (rent) rentData = JSON.parse(rent);
    } catch {
      return res.status(400).json({
        message: "Invalid sell or rent format",
      });
    }

    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const item = await Item.create({
      title,
      description,
      category,
      sell: sellData,
      rent: rentData,
      images: imageData,
      owner: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all public listings
 * @route   GET /api/items
 * @access  Public
 */
module.exports.getAllItems = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isAvailable: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.sell === "true") filter["sell.enabled"] = true;
    if (req.query.rent === "true") filter["rent.enabled"] = true;

    const items = await Item.find(filter)
      .populate("owner", "name institution")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Item.countDocuments(filter);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item
 * @route   GET /api/items/:id
 * @access  Public
 */
module.exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "name institution")
      .lean();

    if (!item || !item.isAvailable) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item (owner only)
 * @route   PUT /api/items/:id
 * @access  Private
 */
module.exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "sell",
      "rent",
      "isAvailable",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "sell" || field === "rent") {
          try {
            item[field] = JSON.parse(req.body[field]);
          } catch {
            return res.status(400).json({
              message: "Invalid sell or rent format",
            });
          }
        } else {
          item[field] = req.body[field];
        }
      }
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete item (owner only)
 * @route   DELETE /api/items/:id
 * @access  Private
 */
module.exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete images from Cloudinary
    for (const image of item.images) {
      await deleteFromCloudinary(image.public_id);
    }

    item.isAvailable = false;
    await item.save();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's listings
 * @route   GET /api/items/my-listings
 * @access  Private
 */
module.exports.getMyListings = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item images (add new images / delete selected images)
 * @route   PUT /api/items/:id/images
 * @access  Private (Owner only)
 */

module.exports.updateItemImages = async (req, res, next) => {
  try {
    const { imagesToDelete } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🔐 Ownership check
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    /* =======================
       1️⃣ DELETE SELECTED IMAGES
       ======================= */
    if (imagesToDelete) {
      let ids;
      try {
        ids = JSON.parse(imagesToDelete);
      } catch {
        return res.status(400).json({
          message: "Invalid imagesToDelete format",
        });
      }

      for (const id of ids) {
        await deleteFromCloudinary(id);
      }

      item.images = item.images.filter((img) => !ids.includes(img.public_id));
    }

    /* =======================
       2️⃣ ADD NEW IMAGES
       ======================= */
    const newImagesCount = req.files ? req.files.length : 0;
    const totalImages = item.images.length + newImagesCount;

    // 🔒 Max 4 images total
    if (totalImages > 4) {
      return res.status(400).json({
        message: "Maximum 4 images allowed per item",
      });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      item.images.push(...newImages);
    }

    await item.save();
    res.json(item);
  } catch (error) {
    next(error);
  }
};
