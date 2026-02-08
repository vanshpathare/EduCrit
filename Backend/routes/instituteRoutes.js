const express = require("express");
const Institute = require("../models/Institute");
const router = express.Router();
const { searchInstitutes } = require("../controllers/instituteController");

// Route: /api/institutes/search?query=...
router.get("/search", searchInstitutes);

// GET /api/institutes
router.get("/", async (req, res) => {
  try {
    // Get all institutes sorted A-Z
    const institutes = await Institute.find().sort({ name: 1 });

    // Return just the names array ["IIT BOMBAY", "VJTI", ...]
    const names = institutes.map((inst) => inst.name);

    res.status(200).json(names);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
});

module.exports = router;
