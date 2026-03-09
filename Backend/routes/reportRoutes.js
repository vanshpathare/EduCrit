const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const protect = require("../middlewares/authMiddleware");

router.post("/", protect, async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    // 1. Validation
    if (!itemId || !reason) {
      return res
        .status(400)
        .json({ message: "Item ID and reason are required" });
    }

    // 2. Create the report using data from the body and the authenticated user
    const newReport = await Report.create({
      reporter: req.user._id, // Reference to the User model
      reporterSnapshot: {
        // Mapping your req.user fields to your snapshot fields
        name: req.user.name,
        phoneNumber:
          req.user.phoneNumber ||
          req.user.phone ||
          req.user.whatsapp?.number ||
          "N/A",
      },
      item: itemId,
      reason: reason,
      // status defaults to "pending" as per your model
    });

    // 3. Success Response
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Report Submission Error:", error);

    // Handle Mongoose validation errors (like minlength: 10)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error while submitting report" });
  }
});

module.exports = router;
