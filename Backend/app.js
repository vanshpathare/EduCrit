const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDb = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");

// Error middleware
const errorMiddleware = require("./middlewares/errorMiddleware");

connectDb();

const app = express();

/**
 * GLOBAL MIDDLEWARES
 */

// Parse cookies
app.use(cookieParser());

// Parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS (for frontend)
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true, // allow cookies
  })
);

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
