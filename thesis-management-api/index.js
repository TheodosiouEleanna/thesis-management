const http = require("http");
const fs = require("fs");
const path = require("path");
const { authenticateWithRedirect } = require("./middleware/authMiddleware");
const { sendResponse } = require("./utils");
const loginRoutes = require("./routes/loginRoutes");
const { pool } = require("./db");

const routes = {};

// Dynamically load all route files
fs.readdirSync(path.join(__dirname, "routes")).forEach((file) => {
  if (file.endsWith("Routes.js")) {
    const routeName = file.replace("Routes.js", "");
    routes[routeName] = require(`./routes/${file}`);
  }
});

const server = http.createServer((req, res) => {
  const pathParts = req.url.split("/").filter(Boolean);

  // Apply authentication middleware for all protected routes
  if (pathParts[0] !== "login") {
    return authenticateWithRedirect(req, res, () => {
      routeHandler(req, res, pathParts);
    });
  }

  // Route to login directly if it's the login endpoint
  if (pathParts[0] === "login") {
    return loginRoutes(req, res);
  }

  sendResponse(res, 404, { error: "Route not found" });
});

// Centralized route handler
const routeHandler = (req, res, pathParts) => {
  const route = routes[pathParts[0]]; // Dynamically match route
  if (route) {
    return route(req, res, pathParts);
  }
  sendResponse(res, 404, { error: "Route not found" });
};

// Start the server
server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err);
  }
})();

(async () => {
  try {
    const res = await pool.query('SELECT * FROM "thesis-management".users');
    console.log("Users:", res.rows);
  } catch (err) {
    console.error("Database query error:", err);
  }
})();
