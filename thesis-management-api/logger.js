const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "server.log");

function logger(req, res) {
  const startTime = Date.now();

  // Log the incoming request
  const { method, url } = req;
  console.log(
    `[${new Date().toISOString()}] Incoming Request: ${method} ${url}`
  );

  // Capture the response finish event
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Response: ${
        res.statusCode
      } ${method} ${url} - ${duration}ms`
    );
  });

  // Capture errors
  res.on("error", (err) => {
    console.error(
      `[${new Date().toISOString()}] Error: ${err.message} - ${method} ${url}`
    );
  });
}

module.exports = logger;
