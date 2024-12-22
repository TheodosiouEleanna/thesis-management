const path = require("path");
const fs = require("fs");

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

const parseMultipartData = (req, boundary) => {
  return new Promise((resolve, reject) => {
    let body = Buffer.alloc(0); // Collect raw binary data

    req.on("data", (chunk) => {
      body = Buffer.concat([body, chunk]); // Append each chunk
    });

    req.on("end", () => {
      const boundaryDelimiter = `--${boundary}`;
      const parts = body
        .toString("binary")
        .split(boundaryDelimiter)
        .filter((part) => part.trim() !== "" && part.trim() !== "--");

      const parsedData = {
        fields: {},
        files: [],
      };

      parts.forEach((part) => {
        const [rawHeaders, ...rawContentArray] = part.split("\r\n\r\n");
        const headers = rawHeaders.split("\r\n");

        // Extract headers
        const contentDisposition = headers.find((header) =>
          header.includes("Content-Disposition")
        );
        const contentType = headers.find((header) =>
          header.includes("Content-Type")
        );

        const nameMatch = contentDisposition.match(/name="(.+?)"/);
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);

        const name = nameMatch ? nameMatch[1] : null;
        const filename = filenameMatch ? filenameMatch[1] : null;

        // Extract raw binary content
        const rawContent = rawContentArray.join("\r\n\r\n").trim();
        const fileBuffer = Buffer.from(rawContent, "binary");

        if (filename) {
          // Handle file
          parsedData.files.push({
            name,
            filename,
            contentType: contentType
              ? contentType.split(": ")[1]
              : "application/octet-stream",
            content: fileBuffer, // Raw binary content
          });
        } else if (name) {
          // Handle form field
          parsedData.fields[name] = rawContent;
        }
      });

      resolve(parsedData);
    });

    req.on("error", (err) => reject(err));
  });
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

/**
 * Saves a file to the uploads directory.
 * @param {Buffer} content - The binary content of the file.
 * @param {string} filename - The original filename of the file.
 * @returns {string} - The path where the file was saved.
 */
const handleFileUpload = (content, filename) => {
  const uploadsDir = path.join(__dirname, "..", "uploads");

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.join(uploadsDir, `${Date.now()}-${filename}`);
  fs.writeFileSync(filePath, content);

  return filePath;
};

module.exports = {
  handleFileUpload,
  parseMultipartData,
  getRequestBody,
  sendResponse,
  getThesisDuration,
};
