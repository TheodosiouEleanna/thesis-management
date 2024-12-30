function displayInfoMessage(message, form, color) {
  let infoDiv = form.querySelector("#infoContainer");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.id = "infoContainer";
    infoDiv.style.color = color;
    infoDiv.style.marginTop = "10px";
    form.appendChild(infoDiv);
  }
  infoDiv.textContent = message;
  setTimeout(() => {
    infoDiv.remove();
  }, 4000);
}

const getRole = (thesis, user) => {
  if (thesis.supervisor_id === user.id) return "supervisor";
  if (thesis.committees.includes(user.id)) return "committee";
  return "other";
};

function filterTheses() {
  const statusFilter = document.getElementById("filter-status").value;
  const roleFilter = document.getElementById("filter-role").value;
  const thesesContainers = document.querySelectorAll(".thesis-container");

  thesesContainers.forEach((container) => {
    const thesis_id = container.id.split("-").pop();
    const thesisStatus = document.getElementById(
      `status-${thesis_id}`
    ).textContent;
    const thesisRole = document.getElementById(`role-${thesis_id}`).textContent;

    const statusMatch =
      !statusFilter || thesisStatus === statusFilter.toLowerCase();

    const roleMatch = !roleFilter || thesisRole.toLowerCase() === roleFilter;

    container.style.display = statusMatch && roleMatch ? "block" : "none";
  });
}

function exportCSV() {
  debugger;
  console.log("Export JSON");
  const thesisContainers = Array.from(
    document.querySelectorAll(".thesis-container")
  ).filter((container) => container.style.display !== "none");

  const data = Array.from(thesisContainers).map((container) => {
    return {
      title: container.querySelector(".thesis-title strong").textContent,
      status: container.querySelector(".status").textContent.trim(),
      role: container.querySelector(".role").textContent.trim(),
    };
  });

  const csv = data.map((row) => Object.values(row).join(",")).join("\n");
  downloadFile("theses.csv", csv);
}

function exportJSON() {
  console.log("Export JSON");
  const thesisContainers = Array.from(
    document.querySelectorAll(".thesis-container")
  ).filter((container) => container.style.display !== "none");
  const data = Array.from(thesisContainers).map((container) => {
    return {
      title: container.querySelector(".thesis-title strong").textContent,
      status: container.querySelector(".status").textContent.trim(),
      role: container.querySelector(".role").textContent.trim(),
    };
  });

  const json = JSON.stringify(data, null, 2);
  downloadFile("theses.json", json);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

async function renderStatistics() {
  debugger;
  console.log("Render statistics");
  const avgCompletionTimeCanvas = document.getElementById(
    "avgCompletionTimeChart"
  );
  const avgGradeCanvas = document.getElementById("avgGradeChart");
  const totalThesesCanvas = document.getElementById("totalThesesChart");

  if (!avgCompletionTimeCanvas || !avgGradeCanvas || !totalThesesCanvas) {
    console.error("Canvas elements not found.");
    return;
  }

  const avgCompletionTimeCtx = avgCompletionTimeCanvas.getContext("2d");
  const avgGradeCtx = avgGradeCanvas.getContext("2d");
  const totalThesesCtx = totalThesesCanvas.getContext("2d");

  new Chart(avgCompletionTimeCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Average Completion Time (months)",
          data: [10, 15, 8, 12, 9, 14],
          backgroundColor: "rgba(75, 192, 192, 0.6)", // Green bars
          borderColor: "rgba(75, 192, 192, 1)", // Green border
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Average Grade Chart
  new Chart(avgGradeCtx, {
    type: "line",
    data: {
      labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
      datasets: [
        {
          label: "Average Grade",
          data: [7.8, 8.2, 8.5, 8.1, 8.7, 9.0],
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Total Theses Chart
  new Chart(totalThesesCtx, {
    type: "pie",
    data: {
      labels: ["Supervised Theses", "Committee Member Theses", "Other Roles"],
      datasets: [
        {
          label: "Role Distribution",
          data: [12, 8, 5],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

function displayAnnouncement(announcement, parentContainer, thesis_id) {
  const announcementContainer = document.createElement("div");
  announcementContainer.id = "announcement-section-" + thesis_id;
  announcementContainer.className = "announcement";
  announcementContainer.style.margin = "20px";

  const announcementHeader = document.createElement("h4");
  announcementHeader.className = "announcementHeader";
  announcementContainer.appendChild(announcementHeader);

  const announcementTextDiv = document.createElement("p");
  announcementTextDiv.className = "announcementText";
  announcementContainer.appendChild(announcementTextDiv);

  // Set the announcement header and text
  announcementHeader.textContent = "Thesis Presentation Announcement:";
  announcementTextDiv.innerHTML = `
      <p><strong>Title:</strong> ${announcement.title}</p>
      <p><strong>Date:</strong> ${new Date(
        announcement.date
      ).toLocaleDateString()}</p>
      <p><strong>Examination Details:</strong> ${announcement.details}</p>
    `;

  parentContainer.appendChild(announcementContainer);
  document.getElementById("errorMessage").style.display = "none";
}

function displayError(errorMessage, parentContainer, thesis_id) {
  const errorContainer = document.createElement("div");
  errorContainer.textContent = errorMessage;
  errorContainer.id = "errorMessage-" + thesis_id;
  errorContainer.style.color = "orange";
  errorContainer.style.marginLeft = "20px";

  parentContainer.appendChild(errorContainer);
}

export {
  displayError,
  displayAnnouncement,
  displayInfoMessage,
  getRole,
  filterTheses,
  exportCSV,
  exportJSON,
  downloadFile,
  renderStatistics,
};
