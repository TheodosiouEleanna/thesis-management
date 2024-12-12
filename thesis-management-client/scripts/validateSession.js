(async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    // Redirect if token is missing
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/validate-session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Redirect if token is invalid
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error validating session:", error);
    window.location.href = "login.html"; // Redirect on error
  }
})();
