const fileRoutes = async (req, res, pathParts, queryParams) => {
  if (method === "GET" && url.startsWith("/download/")) {
    const fileName = url.split("/download/")[1]; // Extract file name from the URL
    const filePath = path.join(__dirname, "files", fileName); // Adjust "files" to your directory containing files

    // Check if the file exists
    fs.exists(filePath, (exists) => {
      if (exists) {
        // Set headers to specify file type and allow download
        res.writeHead(200, {
          "Content-Type": "application/octet-stream", // Default binary type
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        // Stream the file content to the response
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res); // Send the file data to the client

        // Handle errors during file reading
        readStream.on("error", (err) => {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error reading the file.");
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found.");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found.");
  }
};

module.exports = fileRoutes;
