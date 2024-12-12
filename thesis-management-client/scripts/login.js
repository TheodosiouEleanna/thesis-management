document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Clear any previous error messages
    const errorContainer = document.getElementById("errorContainer");
    if (errorContainer) {
      errorContainer.remove();
    }

    try {
      const response = await fetch(`http://localhost:5000/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseBody = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", responseBody.token);
        localStorage.setItem("user", JSON.stringify(responseBody.user));
        window.location.href = "dashboard.html";
      } else {
        // Display the error message from the server
        displayErrorMessage(
          responseBody.error || "Invalid username or password."
        );
      }
    } catch (error) {
      console.error("An error occurred:", error);
      displayErrorMessage(
        "Failed to connect to the server. Please try again later."
      );
    }
  });

function displayErrorMessage(message) {
  const form = document.getElementById("loginForm");

  // Check if an error container already exists and update its message
  let errorDiv = document.getElementById("errorContainer");
  if (!errorDiv) {
    // Create a div for the error message if it doesn't exist
    errorDiv = document.createElement("div");
    errorDiv.id = "errorContainer";
    errorDiv.style.color = "red";
    errorDiv.style.marginTop = "10px";

    // Insert the error message div below the input fields
    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(errorDiv, submitButton);
  }

  // Update the error message content
  errorDiv.textContent = message;
}
