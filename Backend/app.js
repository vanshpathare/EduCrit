const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");

// const connectDb = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");

// Error middleware
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// Enable CORS (for frontend)
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true, // allow cookies
  }),
);

// Parse JSON & form data
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

app.use((req, res, next) => {
  // Makes req.query writable so mongoSanitize doesn't crash
  Object.defineProperty(req, "query", {
    value: req.query,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// Prevent NoSQL Injection
app.use(
  mongoSanitize({
    replaceWith: "_", // replaces $ and . with _
    sanitizeQuery: false,
  }),
);

//app.options("/*", cors());

// Prevent XSS attacks
app.use(xss());

/**
 * GLOBAL MIDDLEWARES
 */

/**
 * ROUTES
 */

// Auth routes (your old logic stays intact)
app.use("/auth", authRoutes);

// Item routes (new feature)
app.use("/api/items", itemRoutes);

// User routes (avatar, profile, etc.)
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("hey from server");
});

/**
 * ERROR HANDLER (MUST BE LAST)
 */
app.use(errorMiddleware);

module.exports = app;
