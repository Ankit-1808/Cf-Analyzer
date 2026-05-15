const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const { createAnalyzeRouter } = require("./routes/analyze");
const AppError = require("./utils/appError");

dotenv.config();

function buildCorsOptions() {
  const configuredOrigins = String(process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new AppError("CORS origin not allowed.", 403, "CORS_FORBIDDEN"));
    }
  };
}

function createApp(options = {}) {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/analyze", createAnalyzeRouter(options.analyzeRouteDeps));

  app.use((req, res, next) => {
    next(new AppError("Route not found.", 404, "ROUTE_NOT_FOUND"));
  });

  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const response = {
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Something went wrong."
      }
    };

    if (error.details) {
      response.error.details = error.details;
    }

    res.status(statusCode).json(response);
  });

  return app;
}

async function startServer() {
  const port = Number(process.env.PORT || 5000);
  await connectDB();

  const app = createApp();
  app.listen(port, () => {
    console.log(`CF Analyzer API running on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  startServer
};
