const { dbQuery } = require("../db");
const { sendResponse } = require("../utils");
const { getRequestBody, getThesisDuration } = require("../utils");

const committeesRoutes = async (req, res, pathParts, queryParams) => {
  const id = pathParts[1]; // Extract ID from URL (if present)

  if (req.method === "GET" && pathParts.length === 1) {
    // Get all committees members that are not invited or rejected
    const query = `SELECT *
    FROM "thesis-management".users u
    WHERE u.id NOT IN (
        SELECT c.member_id
        FROM "thesis-management".committees c
         WHERE c.role = 'supervisor' OR c.invite_status = 'invited' OR c.invite_status = 'rejected'
    ) AND u.role = 'instructor';`;

    const result = await dbQuery(query);

    sendResponse(
      res,
      200,
      result.rows.map((committee) => {
        return {
          member_id: committee.id,
          name: committee.name,
          role: committee.role,
        };
      })
    );
  } else if (
    req.method === "GET" &&
    pathParts.length === 3 &&
    pathParts[2] === "invitations"
  ) {
    // Get committee members by thesis ID
    const query = `SELECT * FROM "thesis-management".committees
    LEFT JOIN "thesis-management".theses ON committees.thesis_id = theses.id
    WHERE member_id = $1 AND invite_status = 'invited';`;
    const result = await dbQuery(query, [id]);
    sendResponse(res, 200, result.rows);
  } else if (req.method === "POST") {
    // Add new committee member
    const request_body = await getRequestBody(req);
    const result = [];
    for (const committee of request_body) {
      const query = `INSERT INTO "thesis-management".committees (thesis_id, member_id, role, invite_status) VALUES
      ($1, $2, $3, $4) RETURNING *;`;
      result.push(
        await dbQuery(query, [
          committee.thesis_id,
          committee.user_id,
          "member",
          "invited",
        ])
      );
    }

    sendResponse(res, 201, result.rows);
  } else if (
    req.method === "PATCH" &&
    id &&
    pathParts.length === 3 &&
    pathParts[2] === "accept"
  ) {
    // Update committee member invite status
    const { thesis_id } = await getRequestBody(req);
    const query = `UPDATE "thesis-management".committees SET invite_status = $1 WHERE thesis_id = $2 AND member_id = $3 RETURNING *`;
    const result = await dbQuery(query, ["accepted", thesis_id, id]);

    const thesis_committees_query = `SELECT * FROM "thesis-management".committees WHERE thesis_id = $1`;
    const thesis_committees_result = await dbQuery(thesis_committees_query, [
      thesis_id,
    ]);

    const hasAtLeastTwoMembers =
      thesis_committees_result.rows.filter(
        (committee) => committee.invite_status === "accepted"
      ).length >= 2;

    if (hasAtLeastTwoMembers) {
      const thesis_query = `UPDATE "thesis-management".theses SET status = $1 WHERE id = $2 RETURNING *`;
      await dbQuery(thesis_query, ["active", thesis_id]);
    }
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Committee member not found" }
    );
  } else if (
    req.method === "PATCH" &&
    id &&
    pathParts.length === 3 &&
    pathParts[2] === "reject"
  ) {
    // Update committee member invite status
    const { thesis_id } = await getRequestBody(req);
    const query = `UPDATE "thesis-management".committees SET invite_status = $1 WHERE thesis_id = $2 AND member_id = $3 RETURNING *`;
    const result = await dbQuery(query, ["rejected", thesis_id, id]);
    sendResponse(
      res,
      result.rows.length ? 200 : 404,
      result.rows[0] || { error: "Committee member not found" }
    );
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
