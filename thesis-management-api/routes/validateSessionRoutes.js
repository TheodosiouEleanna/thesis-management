const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils");

const validateSession = async (req, res) => {
  if (req.method !== "GET") {
    return sendResponse(res, 405, { error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, {
      error: "Unauthorized: Missing or invalid token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally, perform additional checks (e.g., user exists in the database)
    // If required, you can add database calls here to validate user details

    sendResponse(res, 200, { message: "Session valid", user: decoded });
  } catch (error) {
    console.error("Token validation error:", error.message);
    sendResponse(res, 401, { error: "Unauthorized: Invalid token" });
  }
};

module.exports = validateSession;
