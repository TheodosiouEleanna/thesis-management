const loginRoutes = require("./loginRoutes");
const validateSessionRoutes = require("./validateSessionRoutes");
const userRoutes = require("./userRoutes");
const thesesRoutes = require("./thesesRoutes");
const announcementsRoutes = require("./announcementsRoutes");
const committeesRoutes = require("./committeesRoutes");
const gradesRoutes = require("./gradesRoutes");
const progressRoutes = require("./progressRoutes");
const thesisMaterialRoutes = require("./thesisMaterialRoutes");

module.exports = {
  login: loginRoutes,
  validateSession: validateSessionRoutes,
  user: userRoutes,
  theses: thesesRoutes,
  announcements: announcementsRoutes,
  committees: committeesRoutes,
  grades: gradesRoutes,
  progress: progressRoutes,
  thesisMaterial: thesisMaterialRoutes,
};
