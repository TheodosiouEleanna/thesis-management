const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const {
  getRequestBody,
  getThesisDuration,
  parseMultipartData,
  handleFileUpload,
} = require("../utils");
const path = require("path");
const fs = require("fs");

const thesesRoutes = async (req, res, pathParts, queryParams) => {
  // Extract ID from URL (if present)
  let thesis_id = null;
  if (!isNaN(Number(pathParts[1]))) {
    thesis_id = Number(pathParts[1]);
  }

  if (
    req.method === "GET" &&
    pathParts.length === 1 &&
    !queryParams.student_id &&
    !!queryParams.user_id
  ) {
    const user_id = queryParams.user_id;
    const supervisor_thesis_query = `SELECT * FROM "thesis-management".theses WHERE supervisor_id = $1`;
    const supervisor_thesis_result = await dbQuery(supervisor_thesis_query, [
      user_id,
    ]);

    const committee_thesis_query = `SELECT * FROM "thesis-management".theses WHERE id IN (SELECT thesis_id FROM "thesis-management".committees WHERE member_id = $1 AND invite_status = 'accepted')`;
    const committee_thesis_result = await dbQuery(committee_thesis_query, [
      user_id,
    ]);
    sendResponse(
      res,
      200,
      [...supervisor_thesis_result.rows, ...committee_thesis_result.rows].map(
        (thesis) => {
          const thesis_committees_query = `SELECT * FROM "thesis-management".committees
      LEFT JOIN "thesis-management".users ON "thesis-management".committees.member_id = "thesis-management".users.id
      WHERE thesis_id = $1`;
          const thesis_committees_result = dbQuery(thesis_committees_query, [
            thesis.id,
          ]);
          return {
            id: thesis.id,
            title: thesis.title,
            description: thesis.description,
            student_id: thesis.student_id,
            supervisor_id: thesis.supervisor_id,
            status: thesis.status,
            time_elapsed: getThesisDuration(thesis.started_at),
            detailed_file: thesis.detailed_file,
            committees: thesis_committees_result.rows,
          };
        }
      )
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 2 &&
    pathParts[1] === "available"
  ) {
    // Get all available theses
    const query = `SELECT * FROM "thesis-management".theses WHERE student_id IS NULL`;
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (
    req.method === "GET" &&
    pathParts.length === 2 &&
    pathParts[1] === "unassigned"
  ) {
    // Get all available theses
    const query = `SELECT * FROM "thesis-management".theses WHERE supervisor_id = ${queryParams.supervisor_id} AND student_id IS NULL`;
    const result = await dbQuery(query);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "GET" && pathParts.length === 2 && thesis_id) {
    // Get thesis by ID
    const query = `SELECT * FROM "thesis-management".theses WHERE id = $1`;
    const thesis_result = await dbQuery(query, [thesis_id]);

    if (thesis_result.rows.length === 0) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }

    const committees_result = await dbQuery(
      `SELECT * FROM "thesis-management".committees
      LEFT JOIN "thesis-management".users ON "thesis-management".committees.member_id = "thesis-management".users.id
      WHERE thesis_id = $1 `,
      [thesis_result.rows[0].id]
    );

    const supervisor_result = await dbQuery(
      `SELECT * FROM "thesis-management".users WHERE id = $1`,
      [thesis_result.rows[0].supervisor_id]
    );

    sendResponse(
      res,
      thesis_result.rows.length ? 200 : 404,
      thesis_result.rows.length
        ? {
            id: thesis_result.rows[0].id,
            title: thesis_result.rows[0].title,
            description: thesis_result.rows[0].description,
            detailed_file: thesis_result.rows[0].detailed_file,
            student_id: thesis_result.rows[0].student_id,
            supervisor_id: thesis_result.rows[0].supervisor_id,
            status: thesis_result.rows[0].status,
            committees: committees_result.rows,
            supervisor: supervisor_result.rows[0],
            time_elapsed: getThesisDuration(thesis_result.rows[0].started_at)
              .timeElapsedString,
            detailed_file: thesis_result.rows[0].detailed_file,
          }
        : {}
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 1 &&
    !!queryParams.student_id
  ) {
    const student_id = queryParams.student_id;
    // Get thesis by ID
    const query = `SELECT * FROM "thesis-management".theses WHERE student_id = $1`;
    const thesis_result = await dbQuery(query, [student_id]);

    if (thesis_result.rows.length === 0) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }

    const committees_result = await dbQuery(
      `SELECT * FROM "thesis-management".committees
      LEFT JOIN "thesis-management".users ON "thesis-management".committees.member_id = "thesis-management".users.id
      WHERE thesis_id = $1`,
      [thesis_result.rows[0].id]
    );

    const supervisor_result = await dbQuery(
      `SELECT * FROM "thesis-management".users WHERE id = $1`,
      [thesis_result.rows[0].supervisor_id]
    );

    sendResponse(
      res,
      thesis_result.rows.length ? 200 : 404,
      thesis_result.rows.length
        ? {
            id: thesis_result.rows[0].id,
            title: thesis_result.rows[0].title,
            description: thesis_result.rows[0].description,
            detailed_file: thesis_result.rows[0].detailed_file,
            student_id: thesis_result.rows[0].student_id,
            supervisor_id: thesis_result.rows[0].supervisor_id,
            status: thesis_result.rows[0].status,
            committees: committees_result.rows,
            supervisor: supervisor_result.rows[0],
            time_elapsed: getThesisDuration(thesis_result.rows[0].started_at)
              .timeElapsedString,
            detailed_file: thesis_result.rows[0].detailed_file,
          }
        : {}
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 2 &&
    pathParts[1] === "secretariat-list"
  ) {
    const query = `SELECT * FROM "thesis-management".theses WHERE status = 'active' OR status = 'under_examination'`;

    const thesis_result = await dbQuery(query);

    const committees_list = [];
    const material_list = [];
    const grades_list = [];
    for (const thesis of thesis_result.rows) {
      const committees_result = await dbQuery(
        `SELECT * FROM "thesis-management".committees
      LEFT JOIN "thesis-management".users ON "thesis-management".committees.member_id = "thesis-management".users.id
      WHERE thesis_id = $1 AND invite_status = 'accepted'`,
        [thesis.id]
      );
      committees_list.push(committees_result.rows);
      const material_result = await dbQuery(
        `SELECT * FROM "thesis-management".thesis_material WHERE thesis_id = $1`,
        [thesis.id]
      );
      material_list.push(material_result.rows[0]);

      const grades_result = await dbQuery(
        `SELECT * FROM "thesis-management".grades WHERE thesis_id = $1`,
        [thesis.id]
      );
      grades_list.push(grades_result.rows);
    }

    sendResponse(
      res,
      200,
      thesis_result.rows.map((thesis, index) => {
        return {
          id: thesis.id,
          title: thesis.title,
          description: thesis.description,
          student_id: thesis.student_id,
          supervisor_id: thesis.supervisor_id,
          status: thesis.status,
          committees: committees_list[index],
          time_elapsed: getThesisDuration(thesis.started_at).timeElapsedString,
          material: material_list[index],
          grades: grades_list[index],
        };
      })
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "thesis-duration"
  ) {
    // Get thesis duration
    const query = `SELECT started_at FROM "thesis-management".theses WHERE id = $1`;
    const result = await dbQuery(query, [thesis_id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows.length
        ? {
            time_elapsed: getThesisDuration(result.rows[0].started_at)
              .timeElapsed,
            time_elapsed_string: getThesisDuration(result.rows[0].started_at)
              .timeElapsedString,
          }
        : {}
    );
  } else if (req.method === "POST" && pathParts.length === 1) {
    // Add new thesis
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return sendResponse(res, 400, {
        error: "Invalid Content-Type. Expected multipart/form-data",
      });
    }

    // Extract the boundary from Content-Type header
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
      return sendResponse(res, 400, {
        error: "Boundary not found in Content-Type",
      });
    }

    const parsedData = await parseMultipartData(req, boundary);
    const { fields, files } = parsedData;
    const { title, description } = fields;

    const thesis_query = `SELECT * FROM "thesis-management".theses WHERE title = $1`;
    const thesis_result = await dbQuery(thesis_query, [title]);
    if (thesis_result.rows.length) {
      return sendResponse(res, 400, {
        error: "Thesis with the same title already exists",
      });
    }

    if (!files[0]) {
      return sendResponse(res, 400, {
        error: "No file provided for 'detailedFile'",
      });
    }

    const file = files[0];
    const filePath = handleFileUpload(
      file.content,
      `${Date.now()}-${file.filename}`,
      thesis_result.rows[0].id
    );

    const supervisor_id = queryParams.supervisor_id;
    const query = `
    INSERT INTO "thesis-management".theses (title, description, student_id, supervisor_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`;
    const result = await dbQuery(query, [
      title,
      description,
      null,
      supervisor_id,
      "under_assignment",
    ]);

    const thesisId = result.rows[0].id;

    // Update the record with the file path
    const updateQuery = `
    UPDATE "thesis-management".theses
    SET detailed_file = $1
    WHERE id = $2`;
    await dbQuery(updateQuery, [filePath, thesisId]);

    sendResponse(res, 201, result.rows[0]);
  } else if (
    req.method === "PATCH" &&
    pathParts.length === 3 &&
    pathParts[2] === "assign"
  ) {
    const { student_id, topic_id } = await getRequestBody(req);
    // Check if thesis is already assigned or student is already assigned to another thesis
    const checkThesisQuery = `SELECT * FROM "thesis-management".theses WHERE id = $1 AND student_id IS NULL`;
    const checkResult = await dbQuery(checkThesisQuery, [topic_id]);
    if (!checkResult.rows.length) {
      return sendResponse(res, 400, {
        error: "Thesis is already assigned to a student",
      });
    }
    const checkStudentQuery = `SELECT * FROM "thesis-management".theses WHERE student_id = $1`;
    const checkStudentResult = await dbQuery(checkStudentQuery, [student_id]);
    if (checkStudentResult.rows.length) {
      return sendResponse(res, 400, {
        error: "Student is already assigned to another thesis",
      });
    }

    // Assign thesis to student
    const query = `UPDATE "thesis-management".theses SET student_id = $1, status = 'under_assignment', started_at = NOW() WHERE id = $2 RETURNING *`;
    const result = await dbQuery(query, [student_id, topic_id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Thesis not found" }
    );
  } else if (
    req.method === "PUT" &&
    pathParts.length === 2 &&
    thesis_id &&
    req.headers["content-type"].includes("multipart/form-data")
  ) {
    const thesis_query = `SELECT * FROM "thesis-management".theses WHERE id = $1`;
    const thesis_result = await dbQuery(thesis_query, [thesis_id]);
    if (!thesis_result.rows.length) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }
    // Update thesis
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return sendResponse(res, 400, {
        error: "Invalid Content-Type. Expected multipart/form-data",
      });
    }

    // Extract the boundary from Content-Type header
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
      return sendResponse(res, 400, {
        error: "Boundary not found in Content-Type",
      });
    }

    const parsedData = await parseMultipartData(req, boundary);
    const { fields, files } = parsedData;
    const { title, description } = fields;

    let filePath = null;

    if (files[0]) {
      file = files[0];
      filePath = handleFileUpload(
        file.content,
        `${Date.now()}-${file.filename}`,
        thesis_result.rows[0].id
      );
    }

    let result;
    if (!filePath) {
      const query = `
      UPDATE "thesis-management".theses
      SET title = $1, description = $2
      WHERE id = $3
      RETURNING *`;

      // Execute the update query
      result = await dbQuery(query, [
        title, // Title
        description, // Description
        thesis_id, // Thesis ID (where to update)
      ]);
    } else {
      const query = `
        UPDATE "thesis-management".theses
        SET title = $1, description = $2, detailed_file = $3
        WHERE id = $4
        RETURNING *`;

      // Execute the update query
      result = await dbQuery(query, [
        title, // Title
        description, // Description
        filePath, // File path (if provided)
        thesis_id, // Thesis ID (where to update)
      ]);
    }

    sendResponse(res, 200, result.rows[0]);
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
  } else if (
    req.method === "DELETE" &&
    thesis_id &&
    pathParts.length === 3 &&
    pathParts[2] === "cancel"
  ) {
    try {
      // Retrieve thesis data based on thesis_id
      const thesis = await dbQuery(
        `SELECT * FROM "thesis-management".theses WHERE id = $1`,
        [thesis_id]
      );

      if (thesis.rowCount === 0) {
        return sendResponse(res, 404, { error: "Thesis not found" });
      }

      // Assuming supervisor_id is passed in the session or token
      const supervisorId = req.user.id;

      // Check if the user is the supervisor of this thesis
      if (thesis.rows[0].supervisor_id !== supervisorId) {
        return sendResponse(res, 403, {
          message: "Only the supervisor can cancel the assignment.",
        });
      }

      // Delete invitations for the thesis
      const deleteInvitationsResult = await dbQuery(
        `DELETE FROM "thesis-management".committees WHERE thesis_id = $1`,
        [thesis_id]
      );

      // Update the thesis status to "cancelled"
      const updateThesisStatusResult = await dbQuery(
        `UPDATE "thesis-management".theses SET status = 'cancelled', student_id = NULL WHERE id = $1`,
        [thesis_id]
      );

      // Respond with a success message
      sendResponse(res, 200, {
        message: "Thesis assignment canceled successfully.",
      });
    } catch (error) {
      console.error("Error while canceling thesis assignment:", error);
      sendResponse(res, 500, { error: "Internal server error" });
    }
  } else if (
    req.method === "PUT" &&
    thesis_id &&
    pathParts.length === 3 &&
    pathParts[2] === "cancel-thesis"
  ) {
    const student = !!queryParams.student;
    try {
      // Retrieve thesis data based on thesis_id
      const thesis = await dbQuery(
        `SELECT * FROM "thesis-management".theses WHERE id = $1`,
        [thesis_id]
      );

      if (thesis.rowCount === 0) {
        return sendResponse(res, 404, { error: "Thesis not found" });
      }

      const { cancellationId, cancellationDate } = await getRequestBody(req);

      const cancellationReason = student
        ? "at the request of the Student"
        : "By Supervisor";

      // update the thesis status to "cancelled"
      const updateThesisStatusResult = await dbQuery(
        `UPDATE "thesis-management".theses SET status = 'cancelled', student_id = NULL, cancellation_id = $1, cancellation_date = $2, cancellation_reason = $3 WHERE id = $4`,
        [cancellationId, cancellationDate, cancellationReason, thesis_id]
      );

      // Respond with a success message
      sendResponse(res, 200, {
        message: "Thesis canceled successfully.",
      });
    } catch (error) {
      console.error("Error while canceling thesis:", error);
      sendResponse(res, 500, { error: "Internal server error" });
    }
  } else if (
    req.method === "PATCH" &&
    pathParts.length === 3 &&
    pathParts[2] === "record-ap" &&
    thesis_id
  ) {
    const { apNumber } = await getRequestBody(req);
    const query = `UPDATE "thesis-management".theses SET ap_number = $1 WHERE id = $2 RETURNING *`;
    const result = await dbQuery(query, [apNumber, thesis_id]);
    if (result.rowCount === 0) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }
    sendResponse(res, 200, { message: "AP number updated successfully" });
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "members"
  ) {
    const query = `SELECT
        c.*,
        u.*
    FROM "thesis-management".committees c
    LEFT JOIN "thesis-management".users u ON c.member_id = u.id
    WHERE c.thesis_id = $1;`;
    const result = await dbQuery(query, [thesis_id]);
    console.log({ result });
    sendResponse(res, 200, result.rows);
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
    sendResponse(res, 200, result.rows);
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
    sendResponse(res, 200, result.rows);
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
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return sendResponse(res, 400, {
        error: "Invalid Content-Type. Expected multipart/form-data",
      });
    }

    // Extract the boundary from Content-Type header
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
      return sendResponse(res, 400, {
        error: "Boundary not found in Content-Type",
      });
    }

    const query1 = `SELECT * FROM "thesis-management".thesis_material WHERE thesis_id = $1`;
    const thesis_material = await dbQuery(query1, [thesis_id]);

    const query2 = `SELECT * FROM "thesis-management".theses WHERE id = $1`;
    const thesis = await dbQuery(query2, [thesis_id]);

    if (thesis_material.rows.length === 0) {
      return sendResponse(res, 404, { error: "Thesis not found." });
    }

    if (thesis_material.rows.length === 1) {
      const parsedData = await parseMultipartData(req, boundary);
      const { fields, files } = parsedData;
      const { additional_links, exam_date, exam_details, library_link } =
        fields;

      let filePath = null;

      if (files[0]) {
        file = files[0];
        filePath = handleFileUpload(
          file.content,
          `${Date.now()}-${file.filename}`,
          thesis.rows[0].id
        );
      }
      const query = `UPDATE "thesis-management".thesis_material SET additional_material = $1, exam_date = $2, exam_details = $3, library_link = $4, file_url = $5, exam_title = $6 WHERE thesis_id = $7 RETURNING *`;
      const result = await dbQuery(query, [
        additional_links,
        exam_date,
        exam_details,
        library_link,
        filePath,
        "Thesis Presentation for " + thesis.rows[0].title,
        thesis_id,
      ]);
      sendResponse(res, 200, result.rows[0]);
    } else {
      // insert
      const parsedData = await parseMultipartData(req, boundary);
      const { fields, files } = parsedData;
      const { additional_links, exam_date, exam_details, library_link } =
        fields;
    }
  } else if (
    req.method === "POST" &&
    pathParts.length === 3 &&
    pathParts[2] === "draft"
  ) {
    // Ensure 'uploads' directory exists
    const uploadsDir = path.join(
      __dirname,
      "..",
      "uploads",
      thesis_id.toString()
    );

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true }); // Ensure parent directories are created if needed
    }

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

      sendResponse(res, 200, {
        message: "File uploaded successfully",
        filePath: `/uploads/${uniqueFileName}`,
      });
    });

    req.on("error", (err) => {
      console.error("Error while uploading file:", err);
      fileStream.destroy();

      sendResponse(res, 500, { error: "Internal Server Error" });
    });
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "draft"
  ) {
    // Serve the uploaded files
    const filePath = queryParams.file_url;

    fs.readFile(filePath, (err, data) => {
      console.log(`[${new Date().toISOString()}] Serving file: ${filePath}`);
      if (err) {
        // Use sendResponse() to send 404 error
        sendResponse(res, 404, { error: "File not found" });
        return;
      }

      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(data);
    });
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "detailed-file"
  ) {
    // Serve the uploaded files

    const thesis_query = `SELECT * FROM "thesis-management".theses WHERE id = $1`;

    const thesis_result = await dbQuery(thesis_query, [thesis_id]);

    if (!thesis_result.rows.length) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }

    const filePath = thesis_result.rows[0].detailed_file;
    // 'C:\\Users\\theoe\\Desktop\\WorkingFolder\\thesis-management\\uploads\\32\\1735565373686-1735565373686-ai-3317568.pdf'
    fs.readFile(filePath, (err, data) => {
      console.log(`[${new Date().toISOString()}] Serving file: ${filePath}`);
      if (err) {
        // Use sendResponse() to send 404 error
        sendResponse(res, 404, { error: "File not found" });
        return;
      }

      res.writeHead(200, { "Content-Type": "application/octet-stream" });
      res.end(data);
    });
  } else if (
    req.method === "PATCH" &&
    pathParts.length === 3 &&
    pathParts[2] === "change-status" &&
    thesis_id
  ) {
    // Change the status of the thesis
    const thesis_query = `SELECT * FROM "thesis-management".theses WHERE id = $1`;
    const thesis_result = await dbQuery(thesis_query, [thesis_id]);
    if (!thesis_result.rows.length) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }
    // Update the thesis status
    const query = `UPDATE "thesis-management".theses SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await dbQuery(query, ["under_examination", thesis_id]);
    if (result.rows.length === 0) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }
    // Return the updated thesis
    sendResponse(res, 200, result.rows[0]);
  } else if (
    req.method === "PATCH" &&
    pathParts.length === 3 &&
    pathParts[2] === "completed" &&
    thesis_id
  ) {
    const thesis_query = `SELECT * FROM "thesis-management".theses WHERE id = $1`;
    const thesis_result = await dbQuery(thesis_query, [thesis_id]);
    if (!thesis_result.rows.length) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }
    // Update the thesis status
    const query = `UPDATE "thesis-management".theses SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await dbQuery(query, ["completed", thesis_id]);

    sendResponse(res, 200, result.rows[0]);
  } else if (
    req.method === "POST" &&
    pathParts.length === 3 &&
    thesis_id &&
    pathParts[2] === "generate-presentation-announcement"
  ) {
    // Step 1: Check if the student has completed the presentation details
    const studentDetailsQuery = `SELECT * FROM "thesis-management".thesis_material WHERE thesis_id = $1`;
    const result = await dbQuery(studentDetailsQuery, [thesis_id]);

    if (result.rows.length === 0) {
      return sendResponse(res, 404, { error: "Thesis not found" });
    }

    const thesisMaterial = result.rows[0];

    // Check if the presentation details are complete
    if (
      !thesisMaterial.exam_date ||
      !thesisMaterial.exam_title ||
      !thesisMaterial.exam_details
    ) {
      sendResponse(res, 400, {
        error: "Presentation details are incomplete",
      });
    } else {
      // Step 2: Generate the presentation announcement text
      const announcementText = `
        Announcement for Thesis Presentation:
        Title: ${thesisMaterial.exam_title}
        Date: ${thesisMaterial.exam_date.toLocaleDateString()}
        Examination Details: ${thesisMaterial.exam_details}
      `;

      // Step 4: Send the response back to the frontend
      sendResponse(res, 200, {
        text: announcementText,
        title: thesisMaterial.exam_title,
        date: thesisMaterial.exam_date,
        details: thesisMaterial.exam_details,
      });
    }
  } else {
    // Use sendResponse() for 404 Not Found responses
    sendResponse(res, 404, { error: "Not Found" });
  }
};

module.exports = thesesRoutes;
