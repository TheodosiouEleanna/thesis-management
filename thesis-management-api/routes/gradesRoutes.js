const gradesRoutes = async (req, res, pathParts) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all grades
    const query = "SELECT * FROM grades";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get grades for a specific thesis
    const query = "SELECT * FROM grades WHERE thesis_id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No grades found" }
    );
  } else if (req.method === "POST") {
    // Add new grade
    const { thesis_id, member_id, grade } = await getRequestBody(req);
    const query =
      "INSERT INTO grades (thesis_id, member_id, grade) VALUES ($1, $2, $3) RETURNING *";
    const result = await dbQuery(query, [thesis_id, member_id, grade]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update grade
    const { grade } = await getRequestBody(req);
    const query = "UPDATE grades SET grade = $1 WHERE id = $2 RETURNING *";
    const result = await dbQuery(query, [grade, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Grade not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Remove grade
    const query = "DELETE FROM grades WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Grade not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = gradesRoutes;