const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const { getRequestBody, getThesisDuration } = require("../utils");

const progressRoutes = async (req, res, pathParts, queryParams) => {
  const id = pathParts[1]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 1) {
    // Get all progress notes
    const query = "SELECT * FROM progress";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get progress notes by thesis ID
    const query = `SELECT * FROM "thesis-management".progress WHERE thesis_id = $1 AND instructor_id = $2 ORDER BY created_at DESC`;
    const result = await dbQuery(query, [id, queryParams.instructor_id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No progress notes found" }
    );
  } else if (req.method === "POST") {
    // Add new progress note
    const { thesis_id, instructor_id, note } = await getRequestBody(req);
    const query = `INSERT INTO "thesis-management".progress (thesis_id, instructor_id, note) VALUES ($1, $2, $3) RETURNING *`;
    const result = await dbQuery(query, [thesis_id, instructor_id, note]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update progress note
    const { note } = await getRequestBody(req);
    const query = "UPDATE progress SET note = $1 WHERE id = $2 RETURNING *";
    const result = await dbQuery(query, [note, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Progress note not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Remove progress note
    const query = "DELETE FROM progress WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Progress note not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = progressRoutes;
