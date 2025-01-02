const http = require("http");
const fs = require("fs");
const path = require("path");
const { authenticate } = require("./middleware/authMiddleware");
const { sendResponse } = require("./utils");
const loginRoutes = require("./routes/login");
const { pool } = require("./db");
require("dotenv").config(); // Load .env variables
const PORT = process.env.APP_PORT || 5000;
const logger = require("./logger");
const protectedRoutes = require("./routes/routes");
const url = require("url"); // Import the url module
const announcementRoutes = require("./routes/announcements");

const server = http.createServer((req, res) => {
  const method = req.method;
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    // Handle preflight requests
    res.writeHead(204);
    return res.end();
  }
  // Parse the URL, including query parameters
  const parsedUrl = url.parse(req.url, true); // `true` parses query parameters as an object
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  const queryParams = parsedUrl.query; // Extract the query parameters as an object

  // Route to login directly if it's the login endpoint
  if (pathParts[0] === "login") {
    return logger(req, res, loginRoutes(req, res));
  }

  if (pathParts[0] === "announcements") {
    return logger(
      req,
      res,
      announcementRoutes(req, res, pathParts, queryParams)
    );
  }

  // Apply authentication middleware for all protected routes
  if (parsedUrl.pathname.startsWith(`/${pathParts[0]}`)) {
    return authenticate(req, res, () => {
      routeHandler(req, res, pathParts, queryParams);
    });
  }

  sendResponse(res, 404, { error: "Route not found" });
});

// Centralized route handler
const routeHandler = (req, res, pathParts, queryParams) => {
  const route = protectedRoutes[pathParts[0]]; // Dynamically match route
  if (route) {
    return logger(req, res, route(req, res, pathParts, queryParams));
  }
  sendResponse(res, 404, { error: "Route not found" });
};

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
(async () => {
  try {
    const res = await pool.query('SELECT * FROM "thesis-management".users');
    console.log("Users:", res.rows);
    console.log({ protectedRoutes });
  } catch (err) {
    console.error("Database query error:", err);
  }
})();
