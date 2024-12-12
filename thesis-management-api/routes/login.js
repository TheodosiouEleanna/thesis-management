const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getRequestBody, sendResponse } = require("../utils");
const { dbQuery } = require("../db");

const loginRoutes = async (req, res) => {
  if (req.method === "GET") {
  }
  if (req.method !== "POST") {
    return sendResponse(res, 405, { error: "Method not allowed" });
  }

  try {
    const { username, password } = await getRequestBody(req);

    const query = 'SELECT * FROM "thesis-management".users WHERE name = $1';
    const result = await dbQuery(query, [username]);

    if (result.rows.length === 0) {
      return sendResponse(res, 401, { error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return sendResponse(res, 401, { error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    sendResponse(res, 200, { token, user: user });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, 500, { error: "Internal server error" });
  }
};

module.exports = loginRoutes;
