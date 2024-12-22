const announcementsRoutes = async (req, res, pathParts, queryParams) => {
  const id = pathParts[2]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 2) {
    // Get all announcements
    const query = "SELECT * FROM announcements";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && id) {
    // Get a specific announcement
    const query = "SELECT * FROM announcements WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Announcement not found" }
    );
  } else if (req.method === "POST") {
    // Add new announcement
    const { title, content, presentation_date } = await getRequestBody(req);
    const query =
      "INSERT INTO announcements (title, content, presentation_date) VALUES ($1, $2, $3) RETURNING *";
    const result = await dbQuery(query, [title, content, presentation_date]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && id) {
    // Update announcement
    const { title, content, presentation_date } = await getRequestBody(req);
    const query =
      "UPDATE announcements SET title = $1, content = $2, presentation_date = $3 WHERE id = $4 RETURNING *";
    const result = await dbQuery(query, [
      title,
      content,
      presentation_date,
      id,
    ]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Announcement not found" }
    );
  } else if (req.method === "DELETE" && id) {
    // Remove announcement
    const query = "DELETE FROM announcements WHERE id = $1";
    const result = await dbQuery(query, [id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Announcement not found" }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = announcementsRoutes;
