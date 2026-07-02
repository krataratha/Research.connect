const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");

// Import Custom Middlewares
const requestIdMiddleware = require("./common/middlewares/requestId.middleware");
const loggerMiddleware = require("./common/middlewares/logger.middleware");
const responseFormatterMiddleware = require("./common/middlewares/responseFormatter.middleware");
const securityMiddlewares = require("./common/middlewares/security.middleware");
const notFoundMiddleware = require("./common/middlewares/notFound.middleware");
const errorHandlerMiddleware = require("./common/middlewares/errorHandler.middleware");

// Import Modules
const landingModule = require('./modules/landing');
const authModule = require('./modules/authentication');
const profileModule = require('./modules/profile');
const scholarModule = require('./modules/scholar');
const feedModule = require('./modules/feed');
const publicationModule = require('./modules/publication');

const app = express();

// Disable X-Powered-By
app.disable("x-powered-by");

// Request ID assignment
app.use(requestIdMiddleware);

// Security configuration (Helmet, CORS, Limiter)
app.use(securityMiddlewares);

// Compression
app.use(compression());

// Parse incoming request payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static uploaded files
const fs = require("fs");
const path = require("path");
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Request logger
app.use(loggerMiddleware);

// Response formatter helper
app.use(responseFormatterMiddleware);

// Mount API Modules
app.use('/api', landingModule.routes);
app.use('/api/v1/auth', authModule.routes);
app.use('/api/v1/profile', profileModule.routes);
app.use('/api/v1', scholarModule.routes);
app.use('/api/v1', feedModule.routes);
app.use('/api/v1/publications', publicationModule.routes);

// Default root redirect to /api
app.get("/", (req, res) => {
  res.redirect("/api");
});

// Capture non-existent routes
app.use(notFoundMiddleware);

// Centralized error handling
app.use(errorHandlerMiddleware);

module.exports = app;
