const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const { getRequestBody, getThesisDuration } = require("../utils");

const thesesRoutes = async (req, res, pathParts) => {
  const thesis_id = pathParts[1]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 1) {
    // Get all theses
    const query = "SELECT * FROM theses";
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && pathParts.length === 2 && thesis_id) {
    // Get thesis by ID
    const query = `SELECT * FROM "thesis-management".theses WHERE student_id = $1`;
    const thesis_result = await dbQuery(query, [thesis_id]);

    const committees_result = await dbQuery(
      `SELECT * FROM "thesis-management".committees
      LEFT JOIN "thesis-management".users ON "thesis-management".committees.member_id = "thesis-management".users.id
      WHERE thesis_id = $1`,
      [thesis_id]
    );

    sendResponse(res, thesis_result.rows.length ? 200 : 404, {
      id: thesis_result.rows[0].id,
      title: thesis_result.rows[0].title,
      description: thesis_result.rows[0].description,
      detailed_file: thesis_result.rows[0].detailed_file,
      student_id: thesis_result.rows[0].student_id,
      supervisor_id: thesis_result.rows[0].supervisor_id,
      status: thesis_result.rows[0].status,
      committees: committees_result.rows,
      time_elapsed: getThesisDuration(thesis_result.rows[0].started_at),
    });
  } else if (req.method === "POST") {
    // Add new thesis
    const { title, description, student_id, supervisor_id, status } =
      await getRequestBody(req);
    const query = `INSERT INTO "thesis-management".theses (title, description, student_id, supervisor_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await dbQuery(query, [
      title,
      description,
      student_id,
      supervisor_id,
      status,
    ]);
    sendResponse(res, 201, result.rows[0]);
  } else if (req.method === "PUT" && thesis_id) {
    // Update thesis details
    const { title, description, status } = await getRequestBody(req);
    const query = `UPDATE "thesis-management".theses SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *`;
    const result = await dbQuery(query, [
      title,
      description,
      status,
      thesis_id,
    ]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Thesis not found" }
    );
  } else if (req.method === "DELETE" && thesis_id) {
    // Delete thesis
    const query = `DELETE FROM "thesis-management".theses WHERE id = $1`;
    const result = await dbQuery(query, [thesis_id]);
    sendResponse(
      res,
      result.rowCount ? 204 : 404,
      result.rowCount ? {} : { error: "Thesis not found" }
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "invited-members"
  ) {
    const query = `SELECT
        c.*,
        u.*
    FROM "thesis-management".committees c
    LEFT JOIN "thesis-management".users u ON c.member_id = u.id
    WHERE c.thesis_id = $1 AND c.invite_status = 'invited';`;
    const result = await dbQuery(query, [thesis_id]);
    console.log({ result });
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No invited committee members found" }
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "rejected-members"
  ) {
    const query = `SELECT
        c.*,
        u.*
    FROM "thesis-management".committees c
    LEFT JOIN "thesis-management".users u ON c.member_id = u.id
    WHERE c.thesis_id = $1 AND c.invite_status = 'rejected';
    `;
    const result = await dbQuery(query, [thesis_id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows || { error: "No invited committee members found" }
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "material"
  ) {
    const query = `SELECT * FROM "thesis-management".thesis_material WHERE thesis_id = $1`;
    const result = await dbQuery(query, [thesis_id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Thesis material not found." }
    );
  } else {
    sendResponse(res, 405, { error: "Method not allowed" });
  }
};

module.exports = thesesRoutes;
