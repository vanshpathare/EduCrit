const mongoose = require("mongoose");
const fs = require("fs");
const readline = require("readline");
const Institute = require("./models/Institute");
const logger = require("./utils/logger");

// 1. Connect to Database FIRST
console.log("🔌 Connecting to MongoDB..."); // Immediate log

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

require("dotenv").config({ path: envFile });

// 1. Connect to Database
console.log(`🔌 Connecting using file: ${envFile}`);
console.log(
  `🔌 Target Database URI: ...${(process.env.MONGO_URI || "").slice(-20)}`,
); // Prints last 20 chars for safety

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    logger.info("✅ MongoDB Connected. Starting file processing...");

    // 🟢 ONLY START READING FILE HERE (After connection is ready)
    startProcessing();
  })
  .catch((err) => {
    logger.error("❌ MongoDB Connection Error: " + err.message);
    process.exit(1);
  });

// Wrapper function for the logic
function startProcessing() {
  const uniqueInstitutes = new Set();
  const fileStream = fs.createReadStream("College.csv");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    if (!line || line.toUpperCase().startsWith("COLLEGE NAME")) return;

    let cleanName = line.replace(/^"|"$/g, "").trim();

    cleanName = cleanName
      .replace(/\s*\(Id:.*?\)$/i, "")
      .replace(/^\d+\s*-\s*/, "")
      .replace(/^[A-Z0-9]+\s*-\s*/, "")
      .replace(/^\d{6}\s+/, "")
      .trim()
      .toUpperCase();

    if (cleanName.length > 2) {
      uniqueInstitutes.add(cleanName);
    }
  });

  rl.on("close", async () => {
    logger.info(
      `✨ Scrubbing complete. Found ${uniqueInstitutes.size} unique colleges.`,
    );

    const docs = Array.from(uniqueInstitutes).map((name) => ({ name }));

    try {
      logger.info("🚀 Inserting into database...");

      await Institute.insertMany(docs, { ordered: false });

      logger.info("🎉 SUCCESS! Database seeded.");
      process.exit();
    } catch (error) {
      if (error.code === 11000 || error.writeErrors) {
        logger.info("🎉 Done! (Duplicates were skipped).");
        process.exit();
      } else {
        logger.error("❌ Error inserting data: " + error.message);
        process.exit(1);
      }
    }
  });
}
