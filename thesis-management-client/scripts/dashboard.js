import {
  showInfoMessage,
  getRole,
  filterTheses,
  exportCSV,
  exportJSON,
  downloadFile,
  renderStatistics,
} from "../utils.js";

const menuContainer = document.getElementById("role-specific-menu");
const user = JSON.parse(localStorage.getItem("user"));
const userRole = user.role;
let student_thesis_id;
let available_committees;

const student_sections = [
  {
    title: "View Topic",
    fetchData: async () => {
      const student_id = user.id;
      const response = await fetch(
        `http://localhost:5000/theses/${student_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.status === 404) throw new Error("Thesis not found");
      if (!response.ok) throw new Error("Failed to fetch topic data");
      const data = await response.json();
      student_thesis_id = data.id;

      // const supervisor = data.committees.find(
      //   (committee) => committee.role === "supervisor"
      // );
      return `
        <h3>Thesis Details</h3>
        <p><span class="label">Topic:</span> <strong>${data.title}</strong></p>
        <p><span class="label">Description:</span> ${data.description}</p>
        <p><span class="label">Attachment:</span> <a href="${data.detailed_file}" target="_blank">Download Description File</a></p>
        <p><span class="label">Status:</span> <strong>${data.status}</strong></p>
        <p><span class="label">Three-Member Committee:</span> <strong>${data.committees[0].name}</strong>, ${data.committees[1].name}, ${data.committees[2].name}</p>
        <p><span class="label">Time Elapsed:</span> <strong>${data.time_elapsed}</strong></p>
      `;
    },
  },
  {
    title: "Edit Profile",
    fetchData: async () => {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch profile data");
      const data = await response.json();
      return `
        <h3>Edit Contact Information</h3>
        <form id="edit-profile-form">
          <label for="address">Full Postal Address:
          <input type="text" id="address" value="${data.contact_details.address}" />
          </label>

          <label for="email">Contact Email:
          <input type="email" id="email" value="${data.email}" />
          </label>

          <label for="mobile">Mobile Phone:
          <input type="text" id="mobile" value="${data.contact_details.mobile}" />
          </label>

          <label for="landline">Landline Phone:
          <input type="text" id="landline" value="${data.contact_details.phone}" />
          </label>

          <button type="submit" id="save-profile-button">Save</button>
        </form>
      `;
    },
  },
  {
    title: "Manage Thesis Work",
    fetchData: async () => {
      const student_id = user.id;
      const thesis_response = await fetch(
        `http://localhost:5000/theses/${student_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!thesis_response.ok) throw new Error("Thesis Not Found");

      const thesis = await thesis_response.json();
      student_thesis_id = thesis.id;
      if (thesis.status === "under_assignment") {
        const committees_response = await fetch(
          `http://localhost:5000/committees`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!committees_response.ok)
          throw new Error("Failed to fetch thesis work data");

        available_committees = await committees_response.json();

        const invited_members_response = await fetch(
          `http://localhost:5000/theses/${thesis.id}/invited-members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!invited_members_response.ok)
          throw new Error("Failed to fetch thesis work data");

        const invited_members = await invited_members_response.json();

        const rejected_members_response = await fetch(
          `http://localhost:5000/theses/${thesis.id}/rejected-members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!rejected_members_response.ok)
          throw new Error("Failed to fetch thesis work data");

        const members_rejected = await rejected_members_response.json();

        return `<div class="thesis-work">
          <h4 class="label">Your Thesis is: Under Assignment</h4>
          <form id="manage-thesis">
          <p>Select members for the Three-Member Committee:</p>
          <select id="committee-members" multiple>
          ${available_committees
            .map((member) => `<option>${member.name}</option>`)
            .join("")}
          </select>
            <button type="submit" id="add-members-button">Add Members</button>
            </form>
            <div id='invited-members'>
              <div id="invited-members-container">
                ${invited_members
                  .map(
                    (member) => `
                    <div class="invited-member-card">
                      <span class="invitation-icon">&#128233;</span>
                      <span class="member-name">${member.name} is invited</span>
                    </div>
                    `
                  )
                  .join("")}
              </div>
            </div>

            <div id='rejected-members'>
              <div id="rejected-members-container">
                ${members_rejected
                  .map(
                    (member) => `
                    <div class="rejected-member-card">
                      <span class="rejection-icon">&#10060;</span>
                      <span class="member-name">${member.name} has rejected the invitation</span>
                    </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
              </div>`;
      } else if (thesis.status === "under_examination") {
        const thesis_material_response = await fetch(
          `http://localhost:5000/theses/${thesis.id}/material`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_material_response.ok)
          throw new Error("Failed to fetch thesis material");

        const thesis_material = await thesis_material_response.json();

        const dateStr = thesis_material.exam_date;

        // Convert to compatible value for datetime-local input
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toISOString().slice(0, 16); // "2024-11-28T14:49"
        return `
          <div>
            <h4>Your Thesis is: Under Examination</h4>
            <form id="examination-details-form">
              <p>Upload Thesis Draft:</p>
              <input type="file" id="thesis-draft" accept=".pdf,.docx" value=""><a href="/uploads/myfile.pdf" download>${
                thesis_material.file_url
              }</a></input>

              <p>Upload Additional Material (e.g., Google Drive links):</p>
              <input type="text" id="additional-links" placeholder="Enter links" value="${
                thesis_material.additional_material
              }"/>

              <p>Schedule Examination:</p>
              <input type="datetime-local" id="exam-date" value="${formattedDate}"/>

              <p>Examination Details:</p>
              <input type="text" id="exam-details" placeholder="Enter room or connection link" value="${
                thesis_material.exam_details
              }"/>

              <p>Final Submission:</p>
              <input type="text" id="library-link" placeholder="Enter Nemertis link for final thesis" value="${
                thesis_material.library_link ?? ""
              }"/>

              <p>Examination Report:</p>
              <a href="${
                thesis_material.exam_report_url
              }" target="_blank">View Examination Report</a>

              <button type="submit" id="submit-exam-details">Submit</button>
            </form>
          </div>`;
      } else if (thesis.status === "completed") {
        return `
        <div>
        <h4>Completed</h4>
        <p>Thesis Information and Report:</p>
        <a href="" target="_blank">View Examination Report</a>
        </div>
        `;
      }
    },
  },
];

const instructor_sections = [
  {
    title: "View and Create Thesis Topics",
    fetchData: async () => {
      const unassigned_response = await fetch(
        `http://localhost:5000/theses/unassigned?supervisor_id=${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!unassigned_response.ok)
        throw new Error("Failed to fetch unassigned theses");

      const unassignedTheses = await unassigned_response.json();

      return `
        <h3>Thesis Topics</h3>
          <form id="create-thesis-form">
            <label for="title">Title:
              <input type="text" id="title" placeholder="Enter thesis title" required />
            </label>
            <label for="description">Short Description:
              <textarea id="description" placeholder="Enter a short description"></textarea>
            </label>
            <label for="detailed-file">Attach Detailed File (PDF):
              <input type="file" id="detailed-file" accept="application/pdf" />

            </label>
            <button id="create-thesis-topic" type="submit">Create Thesis Topic</button>
          </form>

          <h4>Your Topics:</h4>
          <ul class="unassigned-theses-list">
            ${unassignedTheses
              .map(
                (thesis) => `
                  <li class="unassigned-thesis" id="thesis-${thesis.id}">
                <div id="thesis-container">

                <div class="unassigned-thesis-content">
                <div>
                <strong>${thesis.title}</strong> - ${thesis.description}
                </div>
                <button data-id="${thesis.id}" class="edit-thesis">Edit</button>
                </div>
                </div>
                  <!-- Initially hide the edit form -->
                  <div class="thesis-form-container" id="edit-thesis-form-container-${
                    thesis.id
                  }" style="display:none;">
                  <h4 class="edit-topic-header">Edit Thesis Topic</h4>
                  <form class="edit-thesis-form" id="edit-thesis-form-${
                    thesis.id
                  }">
                  <label for="edit-title">Title:
                  <input type="text" class="edit-title" id="edit-title-${
                    thesis.id
                  }" required />
                  </label>
                  <label for="edit-description">Short Description:
                  <textarea rows="4" class="edit-description" id="edit-description-${
                    thesis.id
                  }"></textarea>
                  </label>
                  <label for="edit-detailed-file">Attach Detailed File (PDF):
                   <input type="file" class="edit-detailed-file" id="edit-detailed-file-${
                     thesis.id
                   }" accept="application/pdf">
                  </label>
                  <label for="href">Detailed File:  &nbsp; &nbsp;
                  <a href="${thesis.detailed_file}" download>${
                  thesis.detailed_file
                    ? `${thesis.detailed_file.split("\\").pop()}`
                    : ""
                }</a>
                </label>
                  <button class="update-thesis-topic" id="update-thesis-topic-${
                    thesis.id
                  }" type="submit">Update Thesis Topic</button>
                  </form>
                  </div>
                  </li>
                `
              )
              .join("")}
              </ul>
      `;
    },
  },
  {
    title: "Initial Assignment of a Topic to a Student",
    fetchData: async () => {
      const students = await fetch(`http://localhost:5000/users/students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!students.ok) throw new Error("Failed to fetch students");
      const studentsData = await students.json();

      const thesis_topics = await fetch(
        `http://localhost:5000/theses/available`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!thesis_topics.ok) throw new Error("Failed to fetch thesis topics");
      const topics = await thesis_topics.json();

      return `
        <h3>Assign Topic to a Student</h3>
        <form id="assign-topic-form">
          <label for="student-id">Student:
            <select id="student-id" required>
              ${studentsData
                .map(
                  (student) =>
                    `<option value="${student.id}">ID: ${student.id}, Name: ${student.name}</option>`
                )
                .join("")}
            </select>
          </label>

          <label for="topic-id">Select Topic:
            <select id="topic-id" required>
              ${topics
                .map(
                  (topic) =>
                    `<option value="${topic.id}">${topic.title}</option>`
                )
                .join("")}
            </select>
          </label>

          <button id="assign-topic" type="submit">Assign Topic</button>
        </form>
      `;
    },
  },
  {
    title: "View List of Theses",
    fetchData: async () => {
      const response = await fetch(
        `http://localhost:5000/theses?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch list of theses");
      const theses = await response.json();

      return `
       <div class="filters">
        <label for="filter-status">Filter by Status:</label>
        <select id="filter-status">
          <option value="">All</option>
          <option value="under_assignment">Under Assignment</option>
          <option value="under_examination">Under Examination</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

    <label for="filter-role">Filter by Role:</label>
    <select id="filter-role">
      <option value="">All</option>
      <option value="supervisor">Supervisor</option>
      <option value="committee member">Committee Member</option>
    </select>
  </div>
  <ul class="thesis-list">
    ${theses
      .map(
        (thesis) => `
        <div id="thesis-container-${thesis.id}" class="thesis-container">
          <li class="thesis-list-item">
          <div class="thesis-content-wrapper">
            <div class="thesis-content">
              <div class="thesis-title"><strong>${thesis.title}</strong></div>
              <div class="thesis-metadata">
                <span id='thesis-status-${
                  thesis.id
                }' class="thesis-status">Status: <span id='status-${
          thesis.id
        }' class="status">${thesis.status}</span class='thesis-role'>
        Role:
        <span id='role-${thesis.id}' class="role">${
          thesis.supervisor_id === user.id ? "Supervisor" : "Committee Member"
        }</span>
          </span>
              </div>
            </div>
            <div class="thesis-actions">
              <button data-id="${
                thesis.id
              }" class="view-thesis">View Details</button>
            </div>
          </div>
          </li>
          <div class="thesis-form-container" id="view-thesis-form-container-${
            thesis.id
          }" style="display:none;">
              <h4 class="view-topic-header">Thesis Details</h4>
              <div class='view-line'>
              <label for="view-title-${thesis.id}">Title:</label>
              <p id="view-title-${thesis.id}">${thesis.title}</p>
              </div>

              <div class='view-line'>
              <label for="view-description-${thesis.id}">Description:</label>
              <p id="view-description-${thesis.id}">${thesis.description}</p>
              </div>

              <div class='view-line'>
              <label for="view-time-elapsed-${thesis.id}">Time Elapsed:</label>
                <p id="view-time-elapsed-${thesis.id}">${
          thesis.time_elapsed
        }</p>
                </div>

              <div class='view-line'>
              <label for="view-student-id-${thesis.id}">Student ID:</label>
              <p id="view-student-id-${thesis.id}">${thesis.student_id}</p>
              </div>

              <div class='view-line'>
              <label for="view-supervisor-id-${
                thesis.id
              }">Supervisor ID:</label>
                <p id="view-supervisor-id-${thesis.id}">${
          thesis.supervisor_id
        }</p>
                  </div>

              <div class='view-line'>
              <label for="view-committees-${thesis.id}">Committees:</label>
              <p id="view-committees-${thesis.id}">${
          thesis.committees?.length > 0
            ? `${thesis.committees[0].name}, ${thesis.committees[1].name}`
            : "None"
        }</p>
                </div>

              <div class='view-line'>
              <label for="view-detailed-file-${
                thesis.id
              }">Detailed File:</label>
                <p id="view-detailed-file-${thesis.id}">
                ${
                  thesis.detailed_file
                    ? `<a href="${thesis.detailed_file}" download>
                  ${thesis.detailed_file.split("\\").pop()}
                  </a>`
                    : "No file available"
                }
                  </p>
                  </div>
            </div>
        </div>
      `
      )
      .join("")}
  <button id="export-csv">Export as CSV</button>
  <button id="export-json">Export as JSON</button>
  </ul>
`;
    },
  },
  {
    title: "View Invitations to Participate in Three-Member Committees",
    fetchData: async () => {
      const response = await fetch(
        `http://localhost:5000/committees/${user.id}/invitations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const invitations = await response.json();

      return `
        <h3>Committee Invitations</h3>
        <ul class="invitations-list">
          ${invitations
            .map(
              (invitation) => `
              <div id="invitation-container">
              <li class="invitation">
              <div>
              <strong>${invitation.title}</strong> - ${invitation.status}
              </div>
              <div>
              <button data-id="${invitation.id}" class="accept-invitation">Accept</button>
              <button data-id="${invitation.id}" class="reject-invitation">Reject</button>
              </div>
              </li>
              </div>
            `
            )
            .join("")}
        </ul>
      `;
    },
  },
  {
    title: "View Statistics",
    fetchData: async () => {
      return `
        <div id="statistics-section">
          <h3>Thesis Statistics</h3>

          <div class="chart-container">
            <h4>Average Completion Time</h4>
            <canvas id="avgCompletionTimeChart" width="400" height="200"></canvas>
          </div>

          <div class="chart-container">
            <h4>Average Grade</h4>
            <canvas id="avgGradeChart" width="400" height="200"></canvas>
          </div>

          <div class="chart-container">
            <h4>Total Number of Theses</h4>
            <canvas id="totalThesesChart" width="400" height="200"></canvas>
          </div>
        </div>
      `;
    },
    afterRender: async () => {
      await renderStatistics();
    },
  },
];

if (userRole === "student") {
  student_sections.forEach(({ title, fetchData }) => {
    const section = document.createElement("div");
    section.classList.add("menu-section");

    const header = document.createElement("div");
    header.classList.add("menu-header");
    header.innerHTML = `
    <span>${title}</span>
    <span class="icon">&#10095;</span>
  `;

    const body = document.createElement("div");
    body.classList.add("menu-body", "collapsed");

    // Toggle functionality
    header.onclick = async () => {
      const isCollapsed = body.classList.toggle("collapsed");
      header.querySelector(".icon").classList.toggle("expanded", !isCollapsed);

      if (!isCollapsed && !body.dataset.loaded) {
        try {
          body.innerHTML = "<p>Loading...</p>";
          const content = await fetchData();
          body.innerHTML = content;
          body.dataset.loaded = "true";
        } catch (error) {
          console.error(`Error loading ${title} data:`, error);
          body.innerHTML = `<p>${error.message}</p>`;
        }
      }
    };

    section.appendChild(header);
    section.appendChild(body);
    menuContainer.appendChild(section);
  });
}

if (userRole === "instructor") {
  instructor_sections.forEach(async ({ title, fetchData, afterRender }) => {
    const section = document.createElement("div");
    section.classList.add("menu-section");

    const header = document.createElement("div");
    header.classList.add("menu-header");
    header.innerHTML = `
      <span>${title}</span>
      <span class="icon">&#10095;</span>
    `;

    const body = document.createElement("div");
    body.classList.add("menu-body", "collapsed");

    header.onclick = async () => {
      const isCollapsed = body.classList.toggle("collapsed");
      header.querySelector(".icon").classList.toggle("expanded", !isCollapsed);

      if (!isCollapsed && !body.dataset.loaded) {
        try {
          body.innerHTML = "<p>Loading...</p>";
          const content = await fetchData();
          body.innerHTML = content;
          body.dataset.loaded = "true";
          if (afterRender) {
            await afterRender();
          }
        } catch (error) {
          console.error(`Error loading ${title} data:`, error);
          body.innerHTML = `<p>${error.message}</p>`;
        }
      }
    };

    section.appendChild(header);
    section.appendChild(body);
    menuContainer.appendChild(section);
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener to a parent container that exists on page load
    const parentContainer = document.body; // or a specific parent container like document.getElementById('thesis-container')

    parentContainer.addEventListener("click", async (event) => {
      // Check if the clicked element has the 'edit-thesis' class
      if (event.target.classList.contains("edit-thesis")) {
        const thesisId = event.target.dataset.id;
        console.log("Click", thesisId);

        // Fetch the specific thesis details for editing
        const thesis_response = await fetch(
          `http://localhost:5000/theses/${thesisId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_response.ok) {
          console.error("Failed to fetch thesis details");
          return;
        }

        const thesisData = await thesis_response.json();

        // Populate the edit form with thesis data
        document.getElementById(`edit-title-${thesisId}`).value =
          thesisData.title;
        document.getElementById(`edit-description-${thesisId}`).value =
          thesisData.description;

        // Toggle visibility of the edit form under the clicked thesis item
        const formContainer = document.getElementById(
          `edit-thesis-form-container-${thesisId}`
        );
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
      }

      if (event.target.classList.contains("view-thesis")) {
        const thesisId = event.target.dataset.id;

        // Fetch the specific thesis details for view
        const thesis_response = await fetch(
          `http://localhost:5000/theses/${thesisId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_response.ok) {
          console.error("Failed to fetch thesis details");
          return;
        }

        const thesisData = await thesis_response.json();
        document.getElementById(`view-title-${thesisId}`).textContent =
          thesisData.title;
        document.getElementById(`view-description-${thesisId}`).textContent =
          thesisData.description;
        document.getElementById(`view-time-elapsed-${thesisId}`).textContent =
          thesisData.time_elapsed;
        document.getElementById(`view-student-id-${thesisId}`).textContent =
          thesisData.student_id;
        document.getElementById(`view-supervisor-id-${thesisId}`).textContent =
          thesisData.supervisor_id;
        document.getElementById(`view-committees-${thesisId}`).textContent =
          thesisData.committees?.length > 0
            ? `${thesisData.committees[0].name}, ${thesisData.committees[1].name}`
            : "Pending";

        const detailedFileElement = document.getElementById(
          `view-detailed-file-${thesisId}`
        );
        detailedFileElement.innerHTML = thesisData.detailed_file
          ? `<a href="${
              thesisData.detailed_file
            }" download>${thesisData.detailed_file.split("\\").pop()}</a>`
          : "No file available";

        // Toggle visibility
        const formContainer = document.getElementById(
          `view-thesis-form-container-${thesisId}`
        );
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target && event.target.id === "filter-status") {
        filterTheses();
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target && event.target.id === "filter-role") {
        filterTheses();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.id === "export-csv") {
        exportCSV();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target && event.target.id === "export-json") {
        exportJSON();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  menuContainer.addEventListener("submit", async (event) => {
    event.preventDefault(); // 🚀 Prevent the default form submission behavior

    console.log(`Form ID: ${event.target.id}`); // Debug log to ensure the form is correctly identified

    if (userRole === "student") {
      if (event.target && event.target.id === "edit-profile-form") {
        const form = event.target;
        const payload = {
          user_id: user.id,
          contact_details: {
            address: form.address.value,
            mobile: form.mobile.value,
            phone: form.landline.value,
          },
          email: form.email.value,
        };

        try {
          const response = await fetch(
            `http://localhost:5000/users/${user.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) throw new Error("Failed to update profile data");

          let infoDiv = document.getElementById("infoContainer");
          if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "infoContainer";
            infoDiv.style.color = "green";
            infoDiv.style.marginTop = "10px";
            const saveButton = document.getElementById("save-profile-button");
            form.insertBefore(infoDiv, saveButton);
          }

          infoDiv.textContent = "Profile updated successfully!";
          setTimeout(() => {
            infoDiv.style.display = "none";
          }, 4000);
        } catch (error) {
          console.error("Error updating profile:", error);
          alert(
            "An error occurred while updating your profile. Please try again."
          );
        }
      }

      if (event.target && event.target.id === "manage-thesis") {
        const form = event.target;
        const selectedOptions = Array.from(
          document.getElementById("committee-members").selectedOptions
        ).map((option) => option.value);

        const selectedCommittees = available_committees.filter((committee) =>
          selectedOptions.includes(committee.name)
        );
        const payload = selectedCommittees.map((committee) => ({
          user_role: committee.role,
          user_id: committee.member_id,
          thesis_id: student_thesis_id,
        }));

        try {
          const response = await fetch(`http://localhost:5000/committees`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok)
            throw new Error("Failed to invite committee members");

          let infoDiv = document.getElementById("infoContainer");
          if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "infoContainer";
            infoDiv.style.color = "green";
            infoDiv.style.marginTop = "10px";
            const saveButton = document.getElementById("add-members-button");
            form.insertBefore(infoDiv, saveButton);
          }

          infoDiv.textContent = "Committee invited successfully!";
          setTimeout(() => {
            infoDiv.style.display = "none";
          }, 4000);
        } catch (error) {
          console.error("Error inviting committee members:", error);
          alert(
            "An error occurred while inviting the committee. Please try again."
          );
        }
      }

      if (event.target && event.target.id === "examination-details-form") {
        const form = event.target;
        const draftFile = document.getElementById("thesis-draft").files[0];
        const additionalLinks =
          document.getElementById("additional-links").value;
        const examDate = document.getElementById("exam-date").value;
        const examDetails = document.getElementById("exam-details").value;
        const libraryLink = document.getElementById("library-link").value;

        if (!draftFile) {
          let infoDiv = document.getElementById("infoContainer");
          if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "infoContainer";
            infoDiv.style.color = "orange";
            infoDiv.style.marginTop = "10px";
            const submitButton = document.getElementById("submit-exam-details");
            form.insertBefore(infoDiv, submitButton);
          }
          infoDiv.textContent = "Please provide a draft file.";
          return; // Early exit
        }

        try {
          const formData = new FormData();
          formData.append("draft", draftFile);

          const payload = {
            additional_links: additionalLinks,
            exam_date: examDate,
            exam_details: examDetails,
            library_link: libraryLink,
          };

          const response = await fetch(
            `http://localhost:5000/theses/${student_thesis_id}/material`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok)
            throw new Error("Failed to submit examination details");

          const uploadResponse = await fetch(
            `http://localhost:5000/theses/${student_thesis_id}/draft`,
            {
              method: "POST",
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok)
            throw new Error("Failed to upload thesis draft");

          let infoDiv = document.getElementById("infoContainer");
          if (!infoDiv) {
            infoDiv = document.createElement("div");
            infoDiv.id = "infoContainer";
            infoDiv.style.color = "green";
            infoDiv.style.marginTop = "10px";
            form.appendChild(infoDiv);
          }
          infoDiv.textContent = "Examination details submitted successfully!";
          setTimeout(() => {
            infoDiv.style.display = "none";
          }, 4000);
        } catch (error) {
          console.error("Error submitting examination details:", error);
          alert("An error occurred. Please try again.");
        }
      }
    }

    if (userRole === "instructor") {
      event.preventDefault(); // Prevent the default form submission behavior
      if (event.target && event.target.id === "create-thesis-form") {
        const form = event.target;
        const thesis_id = event.target.id.split("-").pop();
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const detailedFile = document.getElementById("detailed-file").files[0];

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("detailed_file", detailedFile);

        try {
          const response = await fetch(
            `http://localhost:5000/theses?supervisor_id=${user.id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: formData,
            }
          );

          if (!response.ok) throw new Error("Failed to create thesis topic");

          showInfoMessage(
            "Thesis topic created successfully!",
            `#create-thesis-topic`
          );

          const newThesis = await response.json();
        } catch (error) {
          console.error("Error creating thesis topic:", error);
          alert("An error occurred. Please try again.");
        }
      }

      if (event.target && event.target.id.startsWith("edit-thesis-form")) {
        const form = event.target;
        const thesis_id = event.target.id.split("-").pop();
        const title = document.getElementById(`edit-title-${thesis_id}`).value;
        const description = document.getElementById(
          `edit-description-${thesis_id}`
        ).value;
        const detailedFile = document.getElementById(
          `edit-detailed-file-${thesis_id}`
        ).files[0];

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("detailed_file", detailedFile);

        try {
          const response = await fetch(
            `http://localhost:5000/theses/${thesis_id}?supervisor_id=${user.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: formData,
            }
          );

          if (!response.ok) throw new Error("Failed to create thesis topic");
          showInfoMessage(
            "Thesis topic updated successfully!",
            `#update-thesis-topic-${thesis_id}`
          );

          const newThesis = await response.json();
        } catch (error) {}
      }

      if (event.target && event.target.id.startsWith("assign-topic-form")) {
        const form = event.target;
        const student_id = document.getElementById("student-id").value;
        const topic_id = document.getElementById("topic-id").value;

        const payload = {
          student_id,
          topic_id,
        };

        const response = await fetch(
          `http://localhost:5000/theses/${topic_id}/assign?supervisor_id=${user.id}`,

          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const response_data = await response.json();

        if (!response.ok) {
          showInfoMessage(response_data.error, `#assign-topic`, true);
          throw new Error("Failed to assign topic to student");
        }
        showInfoMessage(
          response_data.error || "Thesis topic assigned successfully!",
          `#assign-topic`
        );
      }
    }
  });
});
