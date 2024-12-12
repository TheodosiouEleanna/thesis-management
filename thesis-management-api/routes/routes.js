const loginRoutes = require("./login");
const validateSessionRoutes = require("./validate-session");
const userRoutes = require("./users");
const thesesRoutes = require("./theses");
const announcementsRoutes = require("./announcements");
const committeesRoutes = require("./committees");
const gradesRoutes = require("./grades");
const progressRoutes = require("./progress");
const thesisMaterialRoutes = require("./thesis-material");

module.exports = {
  login: loginRoutes,
  ["validate-session"]: validateSessionRoutes,
  users: userRoutes,
  committees: committeesRoutes,
  theses: thesesRoutes,
  announcements: announcementsRoutes,
  grades: gradesRoutes,
  progress: progressRoutes,
  ["thesis-material"]: thesisMaterialRoutes,
};
