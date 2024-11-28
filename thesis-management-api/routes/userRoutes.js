const usersRoutes = async (req, res, pathParts) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all users
    const query = "SELECT * FROM users";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get user by ID
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "User not found" }
    );
  } else if (req.method === "POST") {
    // Add new user
    const { name, email, role, password_hash, contact_details } =
      await getRequestBody(req);
    const query =
      "INSERT INTO users (name, email, role, password_hash, contact_details) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await dbQuery(query, [
      name,
      email,
      role,
      password_hash,
      contact_details,
    ]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update user details
    const { name, email, role, contact_details } = await getRequestBody(req);
    const query =
      "UPDATE users SET name = $1, email = $2, role = $3, contact_details = $4 WHERE id = $5 RETURNING *";
    const result = await dbQuery(query, [
      name,
      email,
      role,
      contact_details,
      id,
    ]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "User not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Delete user
    const query = "DELETE FROM users WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "User not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = usersRoutes;
