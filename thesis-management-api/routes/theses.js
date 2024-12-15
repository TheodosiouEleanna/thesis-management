const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const { getRequestBody, getThesisDuration } = require("../utils");
const path = require("path");
const fs = require("fs");

const thesesRoutes = async (req, res, pathParts) => {
  const thesis_id = pathParts[1]; // Extract ID from URL (if present)

  // Ensure 'uploads' directory exists
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

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
  } else if (req.method === "POST" && pathParts.length === 1) {
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
  } else if (req.method === "PUT" && thesis_id && pathParts.length === 2) {
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
  } else if (
    req.method === "PUT" &&
    pathParts.length === 3 &&
    pathParts[2] === "material"
  ) {
    const query1 = `SELECT * FROM "thesis-management".thesis_material WHERE thesis_id = $1`;
    const thesis_material = await dbQuery(query1, [thesis_id]);

    if (thesis_material.rows.length === 0) {
      const { additional_links, exam_date, exam_details, library_link } =
        await getRequestBody(req);

      const query = `UPDATE "thesis-management".thesis_material SET additional_material = $1, exam_date = $2, exam_details = $3, library_link = $4 WHERE thesis_id = $5 RETURNING *`;
      const result = await dbQuery(query, [
        thesis_id,
        additional_links,
        exam_date,
        exam_details,
        library_link,
      ]);
      sendResponse(res, 200, result.rows[0]);
    } else {
      // insert
    }
  } else if (
    req.method === "POST" &&
    pathParts.length === 3 &&
    pathParts[2] === "draft"
  ) {
    // Generate a unique file name to avoid name conflicts
    const uniqueFileName = `draft-${Date.now()}.pdf`;

    // Define where to save the file
    const filePath = path.join(uploadsDir, uniqueFileName);

    const query = `UPDATE "thesis-management".thesis_material SET file_url = $1 WHERE thesis_id = $2 RETURNING *`;
    const result = await dbQuery(query, [
      `/uploads/${uniqueFileName}`,
      thesis_id,
    ]);

    // Create a write stream to save the file
    const fileStream = fs.createWriteStream(filePath);

    req.on("data", (chunk) => {
      console.log(`[${new Date().toISOString()}] Receiving data chunk...`);
      fileStream.write(chunk);
    });

    req.on("end", () => {
      fileStream.end();
      console.log(
        `[${new Date().toISOString()}] File upload complete: ${filePath}`
      );

      // Use sendResponse() instead of res.writeHead() and res.end()
      sendResponse(res, 200, {
        message: "File uploaded successfully",
        filePath: `/uploads/${uniqueFileName}`,
      });
    });

    req.on("error", (err) => {
      console.error("Error while uploading file:", err);
      fileStream.destroy();

      // Use sendResponse() for error responses
      sendResponse(res, 500, { error: "Internal Server Error" });
    });
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "draft"
  ) {
    // Serve the uploaded files
    const filePath = path.join(__dirname, req.url);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Use sendResponse() to send 404 error
        sendResponse(res, 404, { error: "File not found" });
        return;
      }

      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(data);
    });
  } else {
    // Use sendResponse() for 404 Not Found responses
    sendResponse(res, 404, { error: "Not Found" });
  }
};

module.exports = thesesRoutes;
