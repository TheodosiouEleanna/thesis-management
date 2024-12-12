document.getElementById("logout-button").addEventListener("click", () => {
  // Clear user session or token
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");

  // Redirect to login page
  window.location.href = "login.html";
});
