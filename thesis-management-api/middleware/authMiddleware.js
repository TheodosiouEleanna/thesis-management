const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendResponse } = require("../utils");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, { error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    sendResponse(res, 401, { error: "Invalid or expired token" });
  }
};

module.exports = { authenticate };
