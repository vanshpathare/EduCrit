const Institute = require("../models/Institute");
const logger = require("../utils/logger");

// @desc    Search for institutes by name
// @route   GET /api/institutes/search?query=XYZ
// @access  Public
module.exports.searchInstitutes = async (req, res) => {
  try {
    const { query } = req.query;

    // 1. If user hasn't typed anything yet, return empty list (or top 10)
    if (!query) {
      return res.status(200).json([]);
    }

    // 2. Search Logic
    // regex: new RegExp(`^${query}`, "i")  <-- "i" means case-insensitive
    // "^" means "Starts With" (so "MUM" matches "MUMBAI", but not "NEW MUMBAI")
    const results = await Institute.find({
      name: { $regex: new RegExp(`^${query}`, "i") },
    })
      .limit(10) // ⚡ CRITICAL: Only send top 10 results
      .select("name"); // Only send the name field (saves bandwidth)

    res.status(200).json(results);
  } catch (error) {
    logger.error("❌ Search Error: " + error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
