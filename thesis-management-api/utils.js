const getRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(JSON.parse(body || "{}")));
    req.on("error", reject);
  });

const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const getThesisDuration = (started_at) => {
  const startedAt = new Date(started_at);
  const currentTime = new Date();
  const timeElapsed = currentTime.getTime() - startedAt.getTime();

  // Calculate years and months
  const years = Math.floor(timeElapsed / (1000 * 60 * 60 * 24 * 365)); // 365 days in a year
  const remainingTimeAfterYears = timeElapsed % (1000 * 60 * 60 * 24 * 365); // Remaining time after full years
  const months = Math.floor(
    remainingTimeAfterYears / (1000 * 60 * 60 * 24 * 30)
  ); // 30 days in a month (approx)

  // Construct the output
  let timeElapsedString = "";
  if (years > 0) {
    timeElapsedString += `${years} years `;
  }
  if (months > 0 && years === 0) {
    // Include months if there are no full years
    timeElapsedString += `${months} months`;
  }
  if (months === 0 && years === 0) {
    timeElapsedString += "Just started";
  }

  return timeElapsedString;
};

module.exports = { getRequestBody, sendResponse, getThesisDuration };
