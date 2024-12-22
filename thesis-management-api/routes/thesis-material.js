const thesisMaterialRoutes = async (req, res, pathParts, queryParams) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all thesis materials
    const query = "SELECT * FROM thesis_material";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get materials for a specific thesis
    const query = "SELECT * FROM thesis_material WHERE thesis_id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No materials found" }
    );
  } else if (req.method === "POST") {
    // Add new material
    const { thesis_id, file_url, material_type } = await getRequestBody(req);
    const query =
      "INSERT INTO thesis_material (thesis_id, file_url, material_type) VALUES ($1, $2, $3) RETURNING *";
    const result = await dbQuery(query, [thesis_id, file_url, material_type]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update material
    const { file_url, material_type } = await getRequestBody(req);
    const query =
      "UPDATE thesis_material SET file_url = $1, material_type = $2 WHERE id = $3 RETURNING *";
    const result = await dbQuery(query, [file_url, material_type, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Material not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Remove material
    const query = "DELETE FROM thesis_material WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Material not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = thesisMaterialRoutes;
