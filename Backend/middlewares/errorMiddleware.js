const multer = require("multer");
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.warn("Multer error", { message: err.message });

    return res.status(400).json({
      success: false,
      message: err.message || "Too many files uploaded",
    });
  }

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorMiddleware;
