const committeesRoutes = async (req, res, pathParts) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all committees
    const query = "SELECT * FROM committees";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get committee members by thesis ID
    const query = "SELECT * FROM committees WHERE thesis_id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No committee members found" }
    );
  } else if (req.method === "POST") {
    // Add new committee member
    const { thesis_id, member_id, role } = await getRequestBody(req);
    const query =
      "INSERT INTO committees (thesis_id, member_id, role) VALUES ($1, $2, $3) RETURNING *";
    const result = await dbQuery(query, [thesis_id, member_id, role]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update committee member role
    const { role } = await getRequestBody(req);
    const query = "UPDATE committees SET role = $1 WHERE id = $2 RETURNING *";
    const result = await dbQuery(query, [role, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Committee member not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Remove committee member
    const query = "DELETE FROM committees WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Committee member not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = committeesRoutes;
