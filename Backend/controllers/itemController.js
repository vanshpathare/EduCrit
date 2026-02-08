const Item = require("../models/Item");
const Institute = require("../models/Institute");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");
const mongoose = require("mongoose");
const allowedCategories = [
  "books",
  "hardware-projects",
  "software-projects",
  "electronics",
  "stationery",
  "lab-equipment",
  "others",
];
// const allowedFields = ["title", "description", "category", "sell", "rent"];

/**
 * @desc    Create new item
 * @route   POST /api/items
 * @access  Private
 */
module.exports.createItem = async (req, res, next) => {
  try {
    // Clean the input
    if (req.body.institute) {
      const instituteName = req.body.institute.toUpperCase().trim();
      req.body.institute = instituteName; // Update request body

      // "Upsert" (Save if new, ignore if exists)
      await Institute.updateOne(
        { name: instituteName },
        { $set: { name: instituteName } },
        { upsert: true },
      );
    }

    const { title, description, category, sell, rent, videoLink } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category selected",
      });
    }

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

    // 🔒 SELL validation
    if (sellData.enabled) {
      if (!sellData.price || sellData.price <= 0) {
        return res.status(400).json({
          message: "Sell price must be greater than 0 when sell is enabled",
        });
      }
    }

    // 🔒 RENT validation
    if (rentData.enabled) {
      if (!rentData.price || rentData.price <= 0 || !rentData.period) {
        return res.status(400).json({
          message: "Rent price and period are required when rent is enabled",
        });
      }
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
      videoLink: videoLink || null,
      owner: req.user._id,
      institution: req.body.institute || req.user.institution,
    });

    res.status(201).json({
      message: "Item uploaded successfully",
      item,
    });
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

    if (req.query.category) {
      if (!allowedCategories.includes(req.query.category)) {
        return res.status(400).json({ message: "Invalid category filter" });
      }
      filter.category = req.query.category;
    }

    if (req.query.institution) {
      filter.institution = req.query.institution;
    }

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
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const item = await Item.findById(req.params.id)
      .populate("owner", "name institution email whatsapp")
      .lean();

    if (!item || !item.isAvailable) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
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

    if (!item.isAvailable) {
      return res.status(400).json({
        message: "This item has been deleted and cannot be edited",
      });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.body.institute) {
      const instituteName = req.body.institute.toUpperCase().trim();

      // 1. Learn the new name (Upsert)
      await Institute.updateOne(
        { name: instituteName },
        { $set: { name: instituteName } },
        { upsert: true },
      );

      // 2. Update the item's institution field
      // (Frontend sends 'institute', DB expects 'institution')
      item.institution = instituteName;
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "sell",
      "rent",
      "videoLink",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "sell" || field === "rent") {
          let parsed;
          try {
            parsed =
              typeof req.body[field] === "string"
                ? JSON.parse(req.body[field])
                : req.body[field];
          } catch {
            return res.status(400).json({
              message: "Invalid sell or rent format",
            });
          }

          if (field === "sell" && parsed.enabled) {
            if (!parsed.price || parsed.price <= 0) {
              return res.status(400).json({
                message: "Sell price must be greater than 0",
              });
            }
          }

          if (field === "rent" && parsed.enabled) {
            if (!parsed.price || parsed.price <= 0 || !parsed.period) {
              return res.status(400).json({
                message: "Rent price and period are required",
              });
            }
          }

          item[field] = parsed;
        } else if (field === "category") {
          if (!allowedCategories.includes(req.body[field])) {
            return res.status(400).json({
              message: "Invalid category selected",
            });
          }
          item[field] = req.body[field];
        } else {
          item[field] = req.body[field];
        }
      }
    }

    // if (Object.keys(req.body).length === 0) {
    //   return res.status(400).json({
    //     message: "At least one field must be updated",
    //   });
    // }

    const hasValidUpdate =
      allowedFields.some((field) => req.body[field] !== undefined) ||
      (req.files && req.files.length > 0) ||
      req.body.imagesToDelete;

    if (!hasValidUpdate) {
      return res.status(400).json({
        message: "At least one valid field must be updated",
      });
    }

    if (req.body.imagesToDelete) {
      let idsToDelete;
      try {
        idsToDelete = JSON.parse(req.body.imagesToDelete);
      } catch {
        return res.status(400).json({
          message: "Invalid imagesToDelete format",
        });
      }

      for (const id of idsToDelete) {
        await deleteFromCloudinary(id);
      }

      item.images = item.images.filter(
        (img) => !idsToDelete.includes(img.public_id),
      );
    }

    //handling new images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      //checking total limit
      if (item.images.length + newImages.length > 4) {
        return res.status(400).json({
          message: "Maximum 4 images allowed per item",
        });
      }

      item.images.push(...newImages);

      if (item.images.length === 0) {
        return res.status(400).json({
          message: "At least one image is required",
        });
      }
    }

    const updatedItem = await item.save();
    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
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

    if (!item.isAvailable) {
      return res.status(400).json({
        message: "Item already deleted",
      });
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
    const items = await Item.find({ owner: req.user._id, isAvailable: true })
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

    if (!item.isAvailable) {
      return res.status(400).json({
        message: "This item has been deleted and cannot be edited",
      });
    }

    // 🔐 Ownership check
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!imagesToDelete && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "No images provided to update",
      });
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
    res.status(200).json({
      message: "Item images updated successfully",
      images: item.images,
    });
  } catch (error) {
    next(error);
  }
};
