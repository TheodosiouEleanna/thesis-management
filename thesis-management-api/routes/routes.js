const validateSessionRoutes = require("./validate-session");
const userRoutes = require("./users");
const thesesRoutes = require("./theses");
const committeesRoutes = require("./committees");
const gradesRoutes = require("./grades");
const progressRoutes = require("./progress");
const fileRoutes = require("./files");

module.exports = {
  ["validate-session"]: validateSessionRoutes,
  users: userRoutes,
  committees: committeesRoutes,
  theses: thesesRoutes,
  grades: gradesRoutes,
  progress: progressRoutes,
  fileRoutes: fileRoutes,
};
