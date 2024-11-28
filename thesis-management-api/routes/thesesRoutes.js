const thesesRoutes = async (req, res, pathParts) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all theses
    const query = "SELECT * FROM theses";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get thesis by ID
    const query = "SELECT * FROM theses WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Thesis not found" }
    );
  } else if (req.method === "POST") {
    // Add new thesis
    const { title, description, student_id, supervisor_id, status } =
      await getRequestBody(req);
    const query =
      "INSERT INTO theses (title, description, student_id, supervisor_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await dbQuery(query, [
      title,
      description,
      student_id,
      supervisor_id,
      status,
    ]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update thesis details
    const { title, description, status } = await getRequestBody(req);
    const query =
      "UPDATE theses SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *";
    const result = await dbQuery(query, [title, description, status, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Thesis not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Delete thesis
    const query = "DELETE FROM theses WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Thesis not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = thesesRoutes;
