const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGODB_URL);
    // logger.info("MongoDB connected");
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    // 🟢 This will tell you EXACTLY which database you are in
    console.log(`Connected to Database: ${conn.connection.name}`);
    console.log(
      `Using URL: ${process.env.MONGODB_URL ? "URL Found" : "URL MISSING"}`,
    );
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = connectDB;
