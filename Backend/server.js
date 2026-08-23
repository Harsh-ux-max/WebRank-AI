const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// --------------------------------------------------
// DNS CONFIGURATION
// --------------------------------------------------

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// --------------------------------------------------
// ENVIRONMENT
// --------------------------------------------------

require("dotenv").config();

const validateEnv = require("./config/env");

validateEnv();

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

const authRoutes = require("./routes/auth");
const analyzeRoutes = require("./routes/analyze");
const aiRoutes = require("./routes/ai");
const pdfRoutes = require("./routes/pdf");
const compareRoutes = require("./routes/compare");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const contactRoutes = require("./routes/contact");
const compareAIRoutes = require("./routes/compareAIRoutes");
const adminRoutes = require("./routes/adminRoutes");

// --------------------------------------------------
// APP
// --------------------------------------------------

const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------

const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const developmentOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === "production"
    ? []
    : developmentOrigins;

// --------------------------------------------------
// SECURITY MIDDLEWARE
// --------------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header
      // such as Postman/server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },

    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const frontendDirectory = path.join(__dirname, "..", "Frontend");
app.use(express.static(frontendDirectory));

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// --------------------------------------------------
// API RATE LIMIT
// --------------------------------------------------

app.use("/api", apiLimiter);

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use("/api/ai", aiRoutes);

app.use("/api/pdf", pdfRoutes);

app.use("/api/compare", compareRoutes);

app.use("/api/report", reportRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/compare-ai", compareAIRoutes);

app.use("/api/admin", adminRoutes);

// Authentication routes
app.use("/api/auth", authLimiter, authRoutes);

// Website analysis routes
app.use("/api/analyze", analyzeRoutes);

// --------------------------------------------------
// ROOT ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDirectory, "index.html"));
});

// --------------------------------------------------
// ERROR HANDLER
// IMPORTANT: Keep this AFTER all routes
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  // CORS error
  if (err.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed.",
    });
  }

  const statusCode = err.statusCode || 500;

  // Production response
  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      success: false,

      message:
        statusCode === 500
          ? "Internal server error."
          : err.message,
    });
  }

  // Development response
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// --------------------------------------------------
// SERVER STARTUP
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log("🔄 Starting server...");

    console.log(
      "NODE_ENV:",
      process.env.NODE_ENV || "development"
    );

    console.log(
      "MONGO_URI:",
      process.env.MONGO_URI ? "Loaded" : "Missing"
    );

    // ------------------------------------------------
    // CONNECT TO MONGODB FIRST
    // ------------------------------------------------

    if (process.env.NODE_ENV !== "test") {
      console.log("🔄 Connecting to MongoDB...");

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log("✅ MongoDB Connected");
    }

    // ------------------------------------------------
    // START EXPRESS ONLY AFTER DATABASE CONNECTION
    // ------------------------------------------------

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error);

    process.exit(1);
  }
}

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

if (require.main === module) {
  startServer();
}

// --------------------------------------------------
// EXPORT APP FOR TESTING
// --------------------------------------------------

module.exports = app;