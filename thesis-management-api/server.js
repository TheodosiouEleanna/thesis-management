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

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    // Handle preflight requests
    res.writeHead(204);
    return res.end();
  }
  const pathParts = req.url.split("/").filter(Boolean);

  // Route to login directly if it's the login endpoint
  if (pathParts[0] === "login") {
    return logger(req, res, loginRoutes(req, res));
  }

  // Apply authentication middleware for all protected routes
  if (url.startsWith(`/${pathParts[0]}`)) {
    return authenticate(req, res, () => {
      routeHandler(req, res, pathParts);
    });
  }

  sendResponse(res, 404, { error: "Route not found" });
});

// Centralized route handler
const routeHandler = (req, res, pathParts) => {
  const route = protectedRoutes[pathParts[0]]; // Dynamically match route
  if (route) {
    return logger(req, res, route(req, res, pathParts));
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
