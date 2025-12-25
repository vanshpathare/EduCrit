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

    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const item = await Item.create({
      title,
      description,
      category,
      sell: JSON.parse(sell),
      rent: JSON.parse(rent),
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
      "images",
      "isAvailable",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

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
