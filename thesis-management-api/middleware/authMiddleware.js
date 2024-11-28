const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sendResponse } = require("../utils");

const authenticateWithRedirect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(302, { Location: "/login" });
    return res.end();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    res.writeHead(302, { Location: "/login" });
    res.end();
  }
};

module.exports = { authenticateWithRedirect };
