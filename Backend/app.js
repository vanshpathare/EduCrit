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
const instituteRoutes = require("./routes/instituteRoutes");

// Error middleware
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

// Secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false, // To allow loading resources from other origins
    contentSecurityPolicy: false, // Temporarily disable CSP to stop redirect interference
    hsts: false, // Temporarily disable HSTS to stop the HTTPS loop
  }),
);

// Enable CORS (for frontend)

const allowedOrigins = [
  //"https://educrit.vercel.app",
  "https://www.educrit.in",
  "https://educrit.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://educrit-api.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Check if the origin is allowed or is a Vercel preview
      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`CORS REJECTED! Origin: "${origin}"`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 3. The "Preflight" Fix for Node v22
// Replace the old app.options('*') with this:
app.options(/(.*)/, cors());

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

// Add the new one for "consistency"
app.use("/api/auth", authRoutes);

// Item routes (new feature)
app.use("/api/items", itemRoutes);

// User routes (avatar, profile, etc.)
app.use("/api/users", userRoutes);

// Test route
// app.get("/", (req, res) => {
//   res.send("hey from server");
// });

app.use("/api/institutes", instituteRoutes);

app.post("/api/auth/forgot-password", (req, res) => {
  res.status(200).json({ message: "TEST SUCCESS: App.js is receiving this!" });
});

app.post("/api/auth/reset-password", (req, res) => {
  res
    .status(200)
    .json({ message: "TEST SUCCESS: Reset route is receiving this!" });
});

const mode = process.env.NODE_ENV || "development";
console.log(`System running in ${mode} mode.`);

// =========================================================================
// 🟢 SEO & LINK PREVIEW HANDLING (For educrit.in)
// =========================================================================

const fs = require("fs");
const path = require("path");
const Item = require("./models/Item");

// 1. Intercept requests to Item Details Page
app.get("/items/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length !== 24) {
    return next(); // This tells Express to skip this route and move to the next one
  }

  // ⚠️ IMPORTANT: Ensure this path points to your frontend BUILD folder
  const filePath = path.join(__dirname, "../Frontend/educrit/dist/index.html");

  fs.readFile(filePath, "utf8", async (err, htmlData) => {
    if (err) {
      console.error("Error reading index.html", err);
      return res.status(500).send("Error loading page");
    }

    try {
      const item = await Item.findById(req.params.id);

      // Default Fallback if item doesn't exist
      if (!item) {
        return res.send(
          htmlData
            .replace(/__META_TITLE__/g, "EduCrit.in")
            .replace(
              /__META_DESCRIPTION__/g,
              "Academic Exchange Marketplace for Students",
            )
            .replace(/__META_IMAGE__/g, "https://educrit.in/logo.png") // Ensure you have a logo.png in public folder
            .replace(/__META_URL__/g, "https://educrit.in"),
        );
      }

      // --- IMAGE OPTIMIZATION LOGIC ---
      let originalImageUrl = "https://educrit.in/default-preview.png";
      if (item.images && item.images.length > 0) {
        originalImageUrl = item.images[0].url;
      }

      // 🔥 Inject w_600 for WhatsApp optimization (Cloudinary specific)
      const optimizedImage = originalImageUrl.replace(
        "/upload/",
        "/upload/w_600,q_auto/",
      );

      // --- REPLACE PLACEHOLDERS WITH ITEM DATA ---
      const injectedHtml = htmlData
        .replace(/__META_TITLE__/g, `${item.title} | EduCrit.in`)
        .replace(
          /__META_DESCRIPTION__/g,
          `Check out this listing on EduCrit.in. ${item.description.substring(0, 80)}...`,
        )
        .replace(/__META_IMAGE__/g, optimizedImage)
        .replace(/__META_URL__/g, `https://educrit.in/items/${item._id}`);

      res.send(injectedHtml);
    } catch (error) {
      console.error("SEO Injection Error:", error);
      res.send(htmlData); // If error, send page without tags
    }
  });
});

// =========================================================================
// 🟢 STATIC FILE SERVING
// =========================================================================

// Serve static assets (CSS, JS, Images) from the build folder

// The "Catch-All" Handler for all other pages (Home, Login, etc.)

if (process.env.NODE_ENV === "production") {
  // Use path.join for more reliable Linux pathing
  const distPath = path.join(__dirname, "../Frontend/educrit/dist");

  app.use(
    express.static(distPath, {
      index: false, // Prevents Express from serving the raw index.html
    }),
  );

  app.get(/^(?!\/api).+/, (req, res, next) => {
    // 1. Only handle requests that actually want an HTML page
    // This prevents images, CSS, and SSL bots from getting stuck in a loop
    if (!req.accepts("html") || req.url.includes(".")) {
      return next();
    }

    const distPath = path.join(__dirname, "../Frontend/educrit/dist");
    const filePath = path.join(distPath, "index.html");

    fs.readFile(filePath, "utf8", (err, htmlData) => {
      if (err) {
        console.error("HTML FILE NOT FOUND AT:", filePath);
        return res.status(500).send("Error loading page");
      }

      console.log("Successfully injecting Meta Tags for:", req.url);

      // Use a function to avoid issues with double-slashes or unexpected characters
      const defaultHtml = htmlData
        .replace(/__META_TITLE__/g, "EduCrit.in - Student Marketplace")
        .replace(
          /__META_DESCRIPTION__/g,
          "Buy, Sell, and Rent academic resources on EduCrit.in",
        )
        .replace(/__META_IMAGE__/g, "https://educrit.in/logo.png")
        .replace(/__META_URL__/g, "https://educrit.in");

      res.set("Content-Type", "text/html");
      res.send(defaultHtml);
    });
  });
}

/**
 * ERROR HANDLER (MUST BE LAST)
 */
app.use(errorMiddleware);

module.exports = app;
