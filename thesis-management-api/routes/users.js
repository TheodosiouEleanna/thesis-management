const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const { getRequestBody } = require("../utils");

const usersRoutes = async (req, res, pathParts, queryParams) => {
  const id = pathParts[1]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 1) {
    // Get all users
    const query = "SELECT * FROM users";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (
    req.method === "POST" &&
    pathParts.length === 2 &&
    pathParts[1] === "import"
  ) {
    const data = await getRequestBody(req);
    for (instructor of data.instructors) {
      const query = `INSERT INTO "thesis-management".users (name, email, role, password_hash, contact_details) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      const result = await dbQuery(query, [
        instructor.name,
        instructor.email,
        "instructor",
        instructor.password_hash,
        instructor.contact_details,
      ]);
    }
    for (student of data.students) {
      const query = `INSERT INTO "thesis-management".users (name, email, role, password_hash, contact_details) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      const result = await dbQuery(query, [
        student.name,
        student.email,
        "student",
        student.password_hash,
        student.contact_details,
      ]);
    }

    sendResponse(res, 201, {
      message: "Instructors and students imported successfully.",
    });
  } else if (
    req.method === "GET" &&
    pathParts.length === 2 &&
    pathParts[1] === "students"
  ) {
    // Get all users
    const query = `SELECT id, name FROM "thesis-management".users WHERE role = 'student'`;
    const result = await dbQuery(query);
    sendResponse(
      res,
      200,
      result.rows.map(({ id, name }) => ({ id, name }))
    );
  } else if (req.method === "GET" && id) {
    // Get user by ID
    const query = `SELECT * FROM "thesis-management".users WHERE id = $1`;
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
    const { user_id, email, contact_details } = await getRequestBody(req);
    const query = `UPDATE "thesis-management".users SET email = $1, contact_details = $2 WHERE id = $3 RETURNING *`;
    const result = await dbQuery(query, [email, contact_details, user_id]);
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
