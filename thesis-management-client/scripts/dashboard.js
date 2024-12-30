import {
  displayInfoMessage,
  getRole,
  filterTheses,
  exportCSV,
  exportJSON,
  downloadFile,
  renderStatistics,
  displayError,
  displayAnnouncement,
} from "../utils.js";

const menuContainer = document.getElementById("role-specific-menu");
const user = JSON.parse(localStorage.getItem("user"));
const userRole = user.role;
let student_thesis_id;
let available_committees;

// Sections for the dashboard based on user role
const student_sections = [
  {
    title: "View Topic",
    fetchData: async () => {
      const student_id = user.id;
      const response = await fetch(
        `http://localhost:5000/theses?student_id=${student_id}`,
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
        <p><span class="label">Attachment:</span> <a href="${
          data.detailed_file
        }" target="_blank">Download Description File</a></p>
        <p><span class="label">Status:</span> <strong>${
          data.status
        }</strong></p>
        <p><span class="label">Supervisor:</span> <strong>${
          data.supervisor?.name || ""
        }</strong></p>
        <p><span class="label">Three-Member Committee:</span>
        ${
          data.committees.length
            ? `${data.committees[0].name}, ${data.committees[1].name}, ${data.committees[2].name}</p>`
            : "No committees invited yet"
        }

        <p><span class="label">Time Elapsed:</span> <strong>${
          data.time_elapsed
        }</strong></p>
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
        `http://localhost:5000/theses?student_id=${student_id}`,
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

        const dateStr = thesis_material?.exam_date;

        // Convert to compatible value for datetime-local input
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toISOString().slice(0, 16); // "2024-11-28T14:49"
        return `
          <div>
            <h4>Your Thesis is: Under Examination</h4>
            <form id="examination-details-form">
              <p>Upload Thesis Draft:</p>
              <input type="file" id="thesis-draft" accept=".pdf,.docx" value=""><a href="${
                thesis_material?.file_url
              }" download>${
          thesis_material?.file_url.split("\\").pop() ?? ""
        }</a></input>

              <p>Upload Additional Material (e.g., Google Drive links):</p>
              <input type="text" id="additional-links" placeholder="Enter links" value="${
                thesis_material?.additional_material
              }"/>

              <p>Schedule Examination:</p>
              <input type="datetime-local" id="exam-date" value="${formattedDate}"/>

              <p>Examination Details:</p>
              <input type="text" id="exam-details" placeholder="Enter room or connection link" value="${
                thesis_material?.exam_details
              }"/>

              <p>Final Submission:</p>
              <input type="text" id="library-link" placeholder="Enter Nemertis link for final thesis" value="${
                thesis_material.library_link ?? ""
              }"/>

              <p>Examination Report:</p>
              <a href="${
                thesis_material?.exam_report_url
              }" target="_blank">View Examination Report</a>

              <button type="submit" id="submit-exam-details">Submit</button>
            </form>
          </div>`;
      } else if (thesis.status === "active") {
        return `
          <div>
           <h4>Your thesis is active. No further actions available.</h4>
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
                  <a href="${
                    thesis.detailed_file
                  }" download id="download-detailed-file-${thesis.id}">${
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
                    ? `<a href="${
                        thesis.detailed_file
                      }" download id="download-detailed-file-${thesis.id}">
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
            <li id='invitation-${invitation.member_id}-${invitation.thesis_id}' class="invitation">
              <div>
                <strong>${invitation.title}</strong> - ${invitation.status}
              </div>
              <div>
                <button
                  data-id="${invitation.id}"
                  id="accept-invitation-${invitation.member_id}-${invitation.thesis_id}"
                  class="accept-invitation">Accept</button>
                <button
                  data-id="${invitation.id}"
                  id="reject-invitation-${invitation.member_id}-${invitation.thesis_id}"
                  class="reject-invitation">Reject</button>
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
  {
    title: "Manage Thesis Based on Status",
    fetchData: async () => {
      // Fetch theses data based on the user's role (Supervisor or Committee Member)
      const thesesResponse = await fetch(
        `http://localhost:5000/theses?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!thesesResponse.ok) throw new Error("Failed to fetch theses");
      const theses = await thesesResponse.json();

      return `
        <h3>Manage Thesis Based on Status</h3>
        <ul class="thesis-list">
          ${theses
            .map(
              (thesis) => `
              <li class="thesis-list-item" id="thesis-${thesis.id}">
              <div class='thesis-info-wrapper'>
                <div class="thesis-details">
                  <strong>${thesis.title}</strong> - Status: <span id="status-${
                thesis.id
              }">${thesis.status}</span>
                </div>
                <div class="thesis-actions">
                  <!-- Actions based on Thesis Status -->
                  ${
                    thesis.status === "under_assignment"
                      ? `
                    <button class="view-invited-members" data-id="${
                      thesis.id
                    }">View Invited Members</button>
                    ${
                      user.id === thesis.supervisor_id
                        ? `<button class="cancel-assignment" data-id="${thesis.id}">Cancel Assignment</button>`
                        : ""
                    }
                  `
                      : ""
                  }
                  ${
                    thesis.status === "active"
                      ? `
                    <button class="record-note" data-id="${
                      thesis.id
                    }">Record Note</button>
                    ${
                      user.id === thesis.supervisor_id
                        ? `<button class="change-status-to-under-examination" data-id="${thesis.id}">Change Status to Under Examination</button>
                                  <button class="cancel-thesis-assignment" data-id="${thesis.id}">Cancel Thesis</button>
                        `
                        : ""
                    }


                  `
                      : ""
                  }
                  ${
                    thesis.status === "under_examination"
                      ? `
                    <button class="view-thesis-draft" data-id="${thesis.id}">View Thesis Draft</button>
                    <button class="generate-presentation-announcement" data-id="${thesis.id}">Generate Presentation Announcement</button>
                    <button class="record-grade" data-id="${thesis.id}">Record Grade</button>
                  `
                      : ""
                  }
                </div>
                </div>
              </li>
            `
            )
            .join("")}
        </ul>
      `;
    },
    afterRender: async () => {
      // Event listeners for actions related to thesis management
      document.querySelectorAll(".view-invited-members").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const thesisId = e.target.dataset.id;

          // Fetch invited members for this thesis
          const response = await fetch(
            `http://localhost:5000/theses/${thesisId}/members`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (!response.ok) {
            alert("Failed to fetch members");
            return;
          }

          const members = await response.json();

          // Find the thesis container by thesisId
          const thesisItem = document.getElementById(`thesis-${thesisId}`);

          // Check if the "members-info" section already exists
          let membersInfo = thesisItem.querySelector(".members-info");
          if (!membersInfo) {
            membersInfo = document.createElement("div");
            membersInfo.classList.add("members-info");
            thesisItem.appendChild(membersInfo);
          }

          // Display the member details
          if (members.length > 0) {
            membersInfo.innerHTML = `
              <h4>Invited Members</h4>
              <ul class='invited-members-list'>
                ${members
                  .map(
                    (member) => `
                    <li class="member-info">
                      <strong>Name:</strong> ${member.name} <br>
                      <strong>Role:</strong> ${member.role} <br>
                      <strong>Invitation Status:</strong> ${
                        member.invite_status
                      } <br>
                      <strong>Invite Date:</strong> ${new Date(
                        member.invite_date
                      ).toLocaleString()} <br>
                      <strong>Response Date:</strong> ${
                        member.response_date
                          ? new Date(member.response_date).toLocaleString()
                          : "N/A"
                      } <br>
                      <strong>Email:</strong> ${member.email} <br>
                      <strong>Phone:</strong> ${
                        member.contact_details.phone
                      } <br>
                      <strong>Address:</strong> ${
                        member.contact_details.address
                      } <br>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            `;
          } else {
            membersInfo.innerHTML =
              "<p>No invited members for this thesis.</p>";
          }
        });
      });

      document.querySelectorAll(".cancel-assignment").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const thesisId = e.target.dataset.id;
          const response = await fetch(
            `http://localhost:5000/theses/${thesisId}/cancel`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          if (response.ok) {
            const info = document.getElementById(`thesis-${thesisId}`);
            info.textContent = "Thesis canceled";
            info.style.color = "red";
          } else {
            alert("Failed to cancel assignment");
          }
        });
      });

      document.querySelectorAll(".record-note").forEach((button) => {
        button.addEventListener("click", (e) => {
          const thesisId = e.target.dataset.id;
          let noteSection = document.querySelector(`#note-section-${thesisId}`);

          if (noteSection) {
            noteSection.remove();
          }

          noteSection = document.createElement("div");
          noteSection.id = `note-section-${thesisId}`;
          noteSection.classList.add(`note-section`);
          noteSection.innerHTML = `
            <div id='note-form-${thesisId}' class="note-form">
              <textarea id="note-input-${thesisId}" maxlength="300" placeholder="Enter your note (up to 300 characters)..."></textarea>
              <button class="add-note" id="add-note-${thesisId}">Add Note</button>
            </div>
            <h4>Notes</h4>
              <ul class id="note-list-${thesisId}" class="note-list"></ul>
            `;
          document
            .getElementById(`thesis-${thesisId}`)
            .appendChild(noteSection);

          const noteList = [];
          const noteListElement = noteSection.querySelector(
            `#note-list-${thesisId}`
          );

          // Populate existing notes via GET request
          fetch(
            `http://localhost:5000/progress/${thesisId}?instructor_id=${user.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          )
            .then((response) => response.json())
            .then((notes) => {
              if (notes && Array.isArray(notes)) {
                console.log("Notes:", notes);
                notes.forEach((note) => {
                  noteList.push(note);
                  const listItem = document.createElement("li");
                  listItem.classList.add("note-list-item");
                  listItem.textContent = note.note;
                  noteListElement.appendChild(listItem);
                });
              }
            })
            .catch((error) => {
              console.error("Error fetching notes:", error);
            });

          const addNoteButton = noteSection.querySelector(
            `#add-note-${thesisId}`
          );

          addNoteButton.addEventListener("click", () => {
            const noteInput = document.querySelector(`#note-input-${thesisId}`);
            const note = noteInput.value.trim();

            if (note && note.length <= 300) {
              // Add note to the UI list
              noteList.push(note);
              const listItem = document.createElement("li");
              listItem.classList.add("note-list-item");
              listItem.textContent = note;
              noteListElement.appendChild(listItem);

              // Send the note to the server
              fetch(`http://localhost:5000/progress`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({
                  thesis_id: thesisId,
                  note,
                  instructor_id: user.id,
                }),
              })
                .then((response) => {
                  if (response.ok) {
                    const form = document.querySelector(
                      `#note-form-${thesisId}`
                    );
                    displayInfoMessage(
                      "Note recorded successfully",
                      form,
                      "green"
                    );
                    noteInput.value = "";
                  } else {
                    alert("Failed to record note");
                  }
                })
                .catch((error) => {
                  console.error("Error recording note:", error);
                  const form = document.querySelector(`#note-form-${thesisId}`);
                  displayInfoMessage(
                    "Failed to record note. Please try again later.",
                    form,
                    "red"
                  );
                });
            } else {
              alert("Note must be 300 characters or less.");
            }
          });
        });
      });

      document
        .querySelectorAll(".cancel-thesis-assignment")
        .forEach((button) => {
          button.addEventListener("click", async (e) => {
            const thesisId = e.target.dataset.id;

            const response = await fetch(
              `http://localhost:5000/theses/${thesisId}/thesis-duration`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch thesis duration");
            }

            const data = await response.json();

            // Remove existing note section if it exists
            let noteSection = document.querySelector(
              `#note-section-${thesisId}`
            );
            if (noteSection) {
              noteSection.remove();
            }

            const parentElement = document.getElementById(`thesis-${thesisId}`);
            if (!parentElement) {
              console.error(
                `Parent element with ID thesis-${thesisId} not found.`
              );
              return;
            }

            // Create new note section
            noteSection = document.createElement("div");
            noteSection.classList.add("note-section");
            noteSection.id = `note-section-${thesisId}`;

            // Calculate if time elapsed is greater than two years (in seconds)
            const twoYearsInSeconds = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
            const timeElapsedInMilliSeconds = data.time_elapsed;

            // Enable button if time elapsed is greater than 2 years
            const isButtonEnabled =
              timeElapsedInMilliSeconds > twoYearsInSeconds;

            noteSection.innerHTML = `
              <div class='cancel' id='cancel-${thesisId}'>
              ${
                isButtonEnabled
                  ? `
              <h4 for="general-assembly-cancellation" class="general-assembly-cancellation">General
                Assembly Cancellation:
                </h4>
                <form class="cancellation-form">
                      <label for="cancellation-id">Cancellation ID:
                      </label>
                      <input type="number" id="cancellation-id"/>
                      <label for="cancellation-date">Cancellation Date:
                      </label>
                      <input type="date" id="cancellation-date"/>
                      </form>
                    `
                  : ``
              }
                <p><span class="label">Time Elapsed:</span> ${
                  data.time_elapsed_string
                }
                ${
                  isButtonEnabled
                    ? ` <button class="cancel-button" id="cancel-thesis-assignment-${thesisId}">Cancel</button>`
                    : `<p class="info">(You can only cancel if 2 years have passed since the assignment.)</p>`
                }

                </p>
              </div>
            `;

            parentElement.appendChild(noteSection);
          });
        });

      document
        .querySelectorAll(".change-status-to-under-examination")
        .forEach((button) => {
          button.addEventListener("click", async (e) => {
            const thesisId = e.target.dataset.id;

            const parentElement = document.getElementById(`thesis-${thesisId}`);
            parentElement.innerHTML = ``;

            const response = await fetch(
              `http://localhost:5000/theses/${thesisId}/change-status`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );
            const noteSection = document.querySelector(
              `#note-section-${thesisId}`
            );
            if (noteSection) {
              noteSection.remove();
            }

            if (!parentElement) {
              console.error(
                `Parent element with ID thesis-${thesisId} not found.`
              );
              return;
            }

            let message;

            if (response.ok) {
              message = document.createElement("p");
              message.style.color = "green";
              message.style.padding = "5px";
              message.textContent =
                "Thesis status changed to Under Examination";
            } else {
              message = document.createElement("p");
              message.style.color = "red";
              message.style.padding = "5px";
              message.textContent = "Failed to change thesis status";
            }

            parentElement.appendChild(message);

            setTimeout(() => {
              parentElement.removeChild(info);
            }, 5000);

            setTimeout(() => {
              message.remove();
            }, 3000);
          });
        });

      document.querySelectorAll(".view-thesis-draft").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const thesisId = e.target.dataset.id;
          const parentElement = document.getElementById(`thesis-${thesisId}`);

          const gradeSection = document.getElementById(
            `grade-section-${thesisId}`
          );
          if (gradeSection) {
            gradeSection.remove();
          }
          let gradeContainer = document.getElementById(
            `grades-table-${thesisId}`
          );
          if (gradeContainer) {
            gradeContainer.remove();
          }
          let draftSection = document.getElementById(
            `draft-section-${thesisId}`
          );
          if (draftSection) {
            draftSection.remove();
          }
          const announcementSection = document.getElementById(
            `announcement-section-${thesisId}`
          );
          if (announcementSection) {
            announcementSection.remove();
          }
          const errorMessage = document.getElementById(
            `errorMessage-${thesisId}`
          );
          if (errorMessage) {
            errorMessage.remove();
          }

          const thesis_response = await fetch(
            `http://localhost:5000/theses/${thesisId}/material`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (!thesis_response.ok) {
            const info = document.createElement("p");
            info.textContent = "There is no Thesis Draft available";
            info.style.color = "orange";
            info.style.padding = "5px";
            parentElement.appendChild(info);

            setTimeout(() => {
              parentElement.removeChild(info);
            }, 5000);
            throw new Error("Failed to fetch thesis material");
            return;
          }
          const thesis_material = await thesis_response.json();

          const fileUrl = thesis_material.file_url;
          const fileName = fileUrl.split("\\").pop();

          const response = await fetch(
            `http://localhost:5000/theses/${thesisId}/draft?file_url=${fileUrl}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (!response.ok) {
            const info = document.createElement("p");
            info.textContent = "Failed to fetch thesis draft";
            info.style.color = "red";
            info.style.paddingTop = "10px";
            parentElement.appendChild(info);
            throw new Error("Failed to fetch thesis draft");
            return;
          }

          draftSection = document.createElement("label");
          draftSection.textContent = "Draft File: ";
          draftSection.classList.add("draft-section");
          draftSection.id = `draft-section-${thesisId}`;
          draftSection.style.padding = "10px";
          draftSection.style.marginTop = "10px";
          parentElement.appendChild(draftSection);
          const link = document.createElement("a");
          link.style.marginLeft = "20px";
          link.classList.add("draft-link");
          link.download = fileUrl;
          link.textContent = fileName;
          draftSection.appendChild(link);

          const draft = await response.blob();
          link.href = URL.createObjectURL(draft);
        });
      });

      document
        .querySelectorAll(".generate-presentation-announcement")
        .forEach((button) => {
          button.addEventListener("click", async (e) => {
            const thesisId = e.target.dataset.id;
            const parentElement = document.getElementById(`thesis-${thesisId}`);

            const gradeSection = document.getElementById(
              `grade-section-${thesisId}`
            );
            if (gradeSection) {
              gradeSection.remove();
            }
            let gradeContainer = document.getElementById(
              `grades-table-${thesisId}`
            );
            if (gradeContainer) {
              gradeContainer.remove();
            }
            const draftSection = document.getElementById(
              `draft-section-${thesisId}`
            );
            if (draftSection) {
              draftSection.remove();
            }
            const announcementSection = document.getElementById(
              `announcement-section-${thesisId}`
            );
            if (announcementSection) {
              announcementSection.remove();
            }
            const errorMessage = document.getElementById(
              `errorMessage-${thesisId}`
            );
            if (errorMessage) {
              errorMessage.remove();
            }

            const response = await fetch(
              `http://localhost:5000/theses/${thesisId}/generate-presentation-announcement`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );
            const data = await response.json();

            if (response.ok) {
              // Show the announcement

              displayAnnouncement(data, parentElement, thesisId);
            } else {
              // Display error message

              displayError(data.error, parentElement, thesisId);
            }
          });
        });

      document.querySelectorAll(".record-grade").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const thesisId = e.target.dataset.id;
          const parentElement = document.getElementById(`thesis-${thesisId}`);

          let gradeSection = document.getElementById(
            `grade-section-${thesisId}`
          );
          if (gradeSection) {
            gradeSection.remove();
          }
          let gradeContainer = document.getElementById(
            `grades-table-${thesisId}`
          );
          if (gradeContainer) {
            gradeContainer.remove();
          }

          const draftSection = document.getElementById(
            `draft-section-${thesisId}`
          );
          if (draftSection) {
            draftSection.remove();
          }
          const announcementSection = document.getElementById(
            `announcement-section-${thesisId}`
          );
          if (announcementSection) {
            announcementSection.remove();
          }
          const errorMessage = document.getElementById(
            `errorMessage-${thesisId}`
          );
          if (errorMessage) {
            errorMessage.remove();
          }

          // Remove existing UI elements if present
          const existingGradeSection = document.querySelector(
            `#grade-section-${thesisId}`
          );
          if (existingGradeSection) {
            existingGradeSection.remove();
          }

          // Create UI for grade recording
          gradeSection = document.createElement("div");
          gradeSection.id = `grade-section-${thesisId}`;
          gradeSection.classList.add("grade-section");
          gradeSection.innerHTML = `
              <h4 class="grade-header">Record Grade for Thesis</h4>
              <div class="grade-form">
              <label for="grade-input-${thesisId} class='grade-label">Grade:
              <input type="number" id="grade-input-${thesisId}" class="grade-input" min="0" max="10" step="0.1" />
              </label>
              <label for="grade-input-${thesisId} class='grade-label">Criteria:
              <input type="string" id="grade-criteria-${thesisId}" class="grade-criteria" min="0" max="10" step="0.1" />
              </label>
              <button id="submit-grade-${thesisId}" class="submit-grade">Submit Grade</button>
              </div>
              <button id="view-grades-${thesisId}" class="view-grades">View Grades (Committee)</button>
            `;
          parentElement.appendChild(gradeSection);

          // Handle grade submission
          document
            .querySelector(`#submit-grade-${thesisId}`)
            .addEventListener("click", async () => {
              const grade = document.querySelector(
                `#grade-input-${thesisId}`
              ).value;
              const criteria = document.querySelector(
                `#grade-criteria-${thesisId}`
              ).value;
              if (!grade) {
                alert("Please enter a valid grade.");
                return;
              }

              const response = await fetch(
                `http://localhost:5000/grades?thesis_id=${thesisId}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                  },
                  body: JSON.stringify({ grade, criteria, member_id: user.id }),
                }
              );

              if (response.ok) {
                alert(`Grade recorded for Thesis ID ${thesisId}`);
              } else {
                alert("Failed to record grade.");
              }
            });

          // Handle viewing committee grades
          document
            .querySelector(`#view-grades-${thesisId}`)
            .addEventListener("click", async () => {
              const response = await fetch(
                `http://localhost:5000/grades?thesis_id=${thesisId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "authToken"
                    )}`,
                  },
                }
              );

              if (response.ok) {
                const grades = await response.json();

                let existingTable = document.querySelector(
                  `#grades-table-${thesisId}`
                );
                if (existingTable) {
                  existingTable.remove();
                }

                // Create a container for the grades table
                const parentElement = document.getElementById(
                  `thesis-${thesisId}`
                );
                if (!parentElement) {
                  console.error(
                    `Parent element with ID thesis-${thesisId} not found.`
                  );
                  return;
                }

                const tableContainer = document.createElement("div");
                tableContainer.id = `grades-table-${thesisId}`;
                tableContainer.classList.add("grades-container");

                // Generate the table
                const tableHTML = `
                  <table class="grades-table">
                    <thead>
                      <tr>
                        <th>Committee Member</th>
                        <th>Grade</th>
                        <th>Criteria</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${grades
                        .map(
                          (grade) =>
                            `<tr>
                              <td>${grade.name}</td>
                              <td>${grade.grade}</td>
                              <td>${grade.criteria}</td>
                            </tr>`
                        )
                        .join("")}
                    </tbody>
                  </table>
                `;

                // Add the table to the container
                tableContainer.innerHTML = tableHTML;

                // Append the container to the parent element
                parentElement.appendChild(tableContainer);
              } else {
                console.error("Failed to fetch grades for the thesis.");
              }
            });
        });
      });
    },
  },
];

const secretariat_sections = [
  {
    title: "View Theses",
    fetchData: async () => {
      const response = await fetch(
        "http://localhost:5000/theses/secretariat-list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch list of theses for secretariat");
      }
      const theses = await response.json();

      return `
      </ul class="thesis-list">
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
          }' class="status">${thesis.status}
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
                <label for="view-time-elapsed-${
                  thesis.id
                }">Time Elapsed:</label>
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
                        ? `<a  href="${
                            thesis.detailed_file
                          }" download id="download-detailed-file-${thesis.id}">
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
      </ul>
      `;
    },
  },
  {
    title: "Data Import",
    fetchData: async () => {
      return `
        <div id="data-import-container">
          <h5 id="upload-json-quote">Upload a JSON file with student and instructor information:</h5>
          <input type="file" id="data-import-file" accept=""application/JSON"" />
          <button id="upload-json-button">Upload</button>
        </div>
      `;
    },
    afterRender: async () => {
      const uploadButton = document.getElementById("upload-json-button");
      uploadButton.onclick = async () => {
        const fileInput = document.getElementById("data-import-file");
        const file = fileInput.files[0];
        const parentContainer = document.getElementById(
          "data-import-container"
        );

        if (!file) {
          alert("Please select a JSON file to upload.");
          return;
        }

        try {
          const content = await file.text();
          const data = JSON.parse(content);

          const response = await fetch("http://localhost:5000/users/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(response.error);
            const errorMessage = document.createElement("p");
            errorMessage.id = "error-message";
            errorMessage.textContent =
              "Error importing data: " + response.error;
            errorMessage.style.color = "red";
            errorMessage.style.padding = "5px";
            parentContainer.appendChild(errorMessage);
          }

          const successResponse = await response.json();

          const successMessage = document.createElement("p");
          successMessage.id = "success-message";
          successMessage.textContent = successResponse.message;
          successMessage.style.color = "green";
          successMessage.style.padding = "5px";
          parentContainer.appendChild(successMessage);

          setTimeout(() => {
            parentContainer.removeChild(info);
          }, 5000);
        } catch (err) {
          console.error("Error importing data:", err);
          alert("Failed to import data. Ensure the file format is correct.");
        }
      };
    },
  },
  {
    title: "Management of Theses",
    fetchData: async () => {
      // Fetch data for both Active and Under Examination theses
      const response = await fetch(
        "http://localhost:5000/theses/secretariat-list",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch theses data");
      }

      const theses = await response.json();

      return `
      <h3>Manage Thesis Based on Status</h3>
        <div class="thesis-list">
        <ul>
        ${theses
          .map((thesis) => {
            const isReady =
              !!thesis?.material?.library_link && !!thesis?.grades.length;
            console.log("Is ready:", isReady);
            debugger;

            return `
             <li class="thesis-list-item" id="thesis-${thesis.id}">
             <div class="thesis-item">
             <div>
             <p><strong>${thesis.title}</strong></p>
             <p><strong class="thesis-status">Status:</strong> ${
               thesis.status
             }</p>
             <p>${thesis.description}</p>
             </div>
              <div class="thesis-actions">
              ${
                thesis.status === "active"
                  ? `<button class="record-ap-button" data-id="${thesis.id}">Record AP Number</button>
              <button class="cancel-thesis-assignment" data-id="${thesis.id}">Cancel Assignment</button>`
                  : `${
                      isReady
                        ? `<button class="set-as-completed" data-id="${thesis.id}">Set As Completed</button>`
                        : ``
                    }`
              }
              </div>
              </div>
             </li>
            `;
          })
          .join("")}
          </ul>
          </div>
      `;
    },
    afterRender: () => {
      // Add Event Listeners for actions
      document.querySelectorAll(".record-ap-button").forEach((button) => {
        button.addEventListener("click", (event) => {
          debugger;

          const thesisId = event.target.dataset.id;
          const parentElement = document.getElementById(`thesis-${thesisId}`);

          if (!parentElement) {
            console.error(
              `Parent element with ID thesis-${thesisId} not found.`
            );
            return;
          }

          let noteSection = document.querySelector(`#note-section-${thesisId}`);
          if (noteSection) {
            noteSection.remove();
          }

          const newElement = document.createElement("div");
          newElement.classList.add("ap-section");
          newElement.innerHTML = `
          <h4> General Assembly AP Number:</h4>
          <input type="text" id="ap-number" placeholder="Enter AP Number">
          <button class="record-ap" id="record-ap-${thesisId}">Record</button>
          `;

          parentElement.appendChild(newElement);
        });
      });

      document
        .querySelectorAll(".cancel-thesis-assignment")
        .forEach((button) => {
          button.addEventListener("click", async (event) => {
            const thesisId = event.target.dataset.id;

            let noteSection = document.querySelector(
              `#note-section-${thesisId}`
            );
            if (noteSection) {
              noteSection.remove();
            }

            const parentElement = document.getElementById(`thesis-${thesisId}`);
            if (!parentElement) {
              console.error(
                `Parent element with ID thesis-${thesisId} not found.`
              );
              return;
            }

            // Create new note section
            noteSection = document.createElement("div");
            noteSection.classList.add("note-section");
            noteSection.id = `note-section-${thesisId}`;

            noteSection.innerHTML = `
              <div class='cancel' id='cancel-${thesisId}'>
              <h4 for="general-assembly-cancellation" class="general-assembly-cancellation">General
              Assembly Cancellation:
              </h4>
              <form class="cancellation-form">
                    <label for="cancellation-id" id="cancellation-id">Cancellation ID:
                    </label>
                    <input type="number" id="cancellation-id"/>
                    <label for="cancellation-date" id="cancellation-date">Cancellation Date:
                    </label>
                    <input type="date" id="cancellation-date"/>
                    <button class="cancel-button" id="cancel-thesis-assignment-${thesisId}">Cancel</button>
                    </form>
              </div>
            `;

            document.addEventListener("click", async (event) => {
              if (event.target.classList.contains("cancel-button")) {
                const thesisId = event.target.id.split("-").pop();

                console.log(`Cancel button clicked for thesis ID: ${thesisId}`);

                const cancellationId =
                  document.querySelector("#cancellation-id").value;
                const cancellationDate =
                  document.querySelector("#cancellation-date").value;

                console.log(
                  `Cancellation Details - ID: ${cancellationId}, Date: ${cancellationDate}`
                );

                const response = await fetch(
                  `http://localhost:5000/theses/${thesisId}/cancel-thesis`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem(
                        "authToken"
                      )}`,
                    },
                    body: JSON.stringify({ cancellationId, cancellationDate }),
                  }
                );

                if (response.ok) {
                  const info = document.getElementById(`thesis-${thesisId}`);
                  info.textContent = "Thesis canceled";
                  info.style.color = "red";
                } else {
                  alert("Failed to cancel assignment");
                }
              }
            });

            parentElement.appendChild(noteSection);
          });
        });

      document.querySelectorAll(".set-as-completed").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const thesisId = event.target.dataset.id;
          const parentElement = document.getElementById(`thesis-${thesisId}`);
          try {
            const response = await fetch(
              `http://localhost:5000/theses/${thesisId}/completed`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );
            if (!response.ok) {
              throw new Error("Failed to mark thesis as completed");
              const info = document.getElementById(`thesis-${thesisId}`);
              info.textContent = "Failed to mark thesis as completed";
              info.style.color = "red";
              info.style.padding = "5px";
              parentElement.appendChild(info);
            } else {
              const info = document.getElementById(`thesis-${thesisId}`);
              info.textContent = "Thesis marked as completed";
              info.style.color = "green";
              info.style.padding = "5px";
              parentElement.appendChild(info);
            }
            setTimeout(() => {
              parentElement.removeChild(info);
            }, 5000);
          } catch (error) {
            console.error("Error marking thesis as completed:", error);
          }
        });
      });
    },
  },
];

// Menu sections based on user role (student, instructor, secretariat)
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

  // Event delegation
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-thesis")) {
      const thesisId = event.target.dataset.id;

      try {
        const thesis_response = await fetch(
          `http://localhost:5000/theses/${thesisId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_response.ok)
          throw new Error("Failed to fetch thesis details");

        const thesisData = await thesis_response.json();

        // Populate the form
        document.getElementById(`edit-title-${thesisId}`).value =
          thesisData.title;
        document.getElementById(`edit-description-${thesisId}`).value =
          thesisData.description;

        // Toggle visibility
        const formContainer = document.getElementById(
          `edit-thesis-form-container-${thesisId}`
        );
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
      } catch (error) {
        console.error(`Error fetching thesis data:`, error);
      }
    }

    if (event.target.classList.contains("view-thesis")) {
      const thesisId = event.target.dataset.id;

      try {
        const thesis_response = await fetch(
          `http://localhost:5000/theses/${thesisId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_response.ok)
          throw new Error("Failed to fetch thesis details");

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
            ? thesisData.committees.map((c) => c.name).join(", ")
            : "Pending";

        const detailedFileElement = document.getElementById(
          `view-detailed-file-${thesisId}`
        );
        detailedFileElement.innerHTML = thesisData.detailed_file
          ? `<a href="${
              thesisData.detailed_file
            }" download id="download-detailed-file-${thesisData.id}">
               ${thesisData.detailed_file.split("\\").pop()}
             </a>`
          : "No file available";

        // Toggle visibility
        const formContainer = document.getElementById(
          `view-thesis-form-container-${thesisId}`
        );
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
      } catch (error) {
        console.error(`Error fetching thesis data:`, error);
      }
    }

    if (event.target.classList.contains("accept-invitation")) {
      const member_id = event.target.id.split("-")[2];
      const thesis_id = event.target.id.split("-")[3];

      try {
        const response = await fetch(
          `http://localhost:5000/committees/${member_id}/accept`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ thesis_id }),
          }
        );

        if (!response.ok) throw new Error("Failed to accept invitation");

        const invitation_item = document.getElementById(
          `invitation-${member_id}-${thesis_id}`
        );
        invitation_item.textContent = "Accepted";
        invitation_item.style.color = "green";
      } catch (error) {
        console.error(error.message);
      }
    }

    if (event.target.classList.contains("reject-invitation")) {
      const member_id = event.target.id.split("-")[2];
      const thesis_id = event.target.id.split("-")[3];
      try {
        const response = await fetch(
          `http://localhost:5000/committees/${member_id}/reject`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ thesis_id }),
          }
        );

        if (!response.ok) throw new Error("Failed to reject invitation");

        const invitation_item = document.getElementById(
          `invitation-${member_id}-${thesis_id}`
        );
        invitation_item.textContent = "Rejected";
        invitation_item.style.color = "red";
      } catch (error) {
        console.error(error.message);
      }
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target && event.target.id === "filter-status") {
      filterTheses();
    }
    if (event.target && event.target.id === "filter-role") {
      filterTheses();
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "export-csv") {
      exportCSV();
    }
    if (event.target && event.target.id === "export-json") {
      exportJSON();
    }
  });

  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("cancel-button")) {
      const thesisId = event.target.id.split("-").pop();

      console.log(`Cancel button clicked for thesis ID: ${thesisId}`);

      // Add your cancellation logic here
      const cancellationId = document.querySelector("#cancellation-id").value;
      const cancellationDate =
        document.querySelector("#cancellation-date").value;

      console.log(
        `Cancellation Details - ID: ${cancellationId}, Date: ${cancellationDate}`
      );

      const response = await fetch(
        `http://localhost:5000/theses/${thesisId}/cancel-thesis`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ cancellationId, cancellationDate }),
        }
      );

      if (response.ok) {
        const info = document.getElementById(`thesis-${thesisId}`);
        info.textContent = "Thesis canceled";
        info.style.color = "red";
      } else {
        alert("Failed to cancel assignment");
      }
    }
  });
}

if (userRole === "secretariat") {
  secretariat_sections.forEach(async ({ title, fetchData, afterRender }) => {
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

  document.addEventListener("click", async (event) => {
    event.preventDefault();

    if (event.target.classList.contains("view-thesis")) {
      const thesisId = event.target.dataset.id;

      try {
        const thesis_response = await fetch(
          `http://localhost:5000/theses/${thesisId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!thesis_response.ok)
          throw new Error("Failed to fetch thesis details");

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
            ? thesisData.committees.map((c) => c.name).join(", ")
            : "Pending";

        const detailedFileElement = document.getElementById(
          `view-detailed-file-${thesisId}`
        );
        detailedFileElement.innerHTML = thesisData.detailed_file
          ? `<a href="${
              thesisData.detailed_file
            }" download id="download-detailed-file-${thesisData.id}">
               ${thesisData.detailed_file.split("\\").pop()}
             </a>`
          : "No file available";

        // Toggle visibility
        const formContainer = document.getElementById(
          `view-thesis-form-container-${thesisId}`
        );
        formContainer.style.display =
          formContainer.style.display === "none" ? "block" : "none";
      } catch (error) {
        console.error(`Error fetching thesis data:`, error);
      }
    }

    if (event.target.id.startsWith("download-detailed-file")) {
      const thesisId = event.target.id.split("-").pop();
      const parentElement = document.getElementById(
        `view-thesis-form-container-${thesisId}`
      );

      const fileUrl = event.target.href;
      const fileName = fileUrl.split("/").pop();

      const response = await fetch(
        `http://localhost:5000/theses/${thesisId}/detailed-file`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        const info = document.createElement("p");
        info.textContent = "Failed to fetch thesis detailed file.";
        info.style.color = "red";
        info.style.marginLeft = "40px";
        info.style.marginTop = "10px";
        parentElement.appendChild(info);
        throw new Error("Failed to fetch thesis detailed file.");
        return;
      }

      setTimeout(() => {
        parentElement.removeChild(info);
      }, 5000);
      // 'C:\\Users\\theoe\\Desktop\\WorkingFolder\\thesis-management\\uploads\\32\\1735565373686-1735565373686-ai-3317568.pdf'
      const detailedFile = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(detailedFile);
      link.download = fileName;
      link.click();
    }

    if (event.target.id.startsWith("record-ap")) {
      const thesisId = event.target.id.split("-").pop();
      const parentElement = document.getElementById(`thesis-${thesisId}`);

      const apNumber = document.getElementById("ap-number").value;

      const response = await fetch(
        `http://localhost:5000/theses/${thesisId}/record-ap`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ apNumber }),
        }
      );
      let info;
      if (!response.ok) {
        info = document.createElement("p");
        info.textContent = "Failed to record AP number.";
        info.style.color = "red";
        info.style.marginLeft = "40px";
        info.style.marginTop = "10px";
        parentElement.appendChild(info);
      } else {
        info = document.createElement("p");
        info.textContent = "AP number recorded successfully.";
        info.style.color = "green";
        info.style.marginLeft = "40px";
        info.style.marginTop = "10px";
        parentElement.appendChild(info);
      }
      setTimeout(() => {
        parentElement.removeChild(info);
      }, 5000);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  menuContainer.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const form = event.target;
    const formId = form.id;

    if (userRole === "student") {
      // Edit Profile Form
      if (formId === "edit-profile-form") {
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

          displayInfoMessage("Profile updated successfully!", form, "green");
        } catch (error) {
          console.error("Error updating profile:", error);
          displayInfoMessage(
            "Error updating profile. Please try again.",
            form,
            "red"
          );
        }
      }

      // Manage Thesis Form
      if (formId === "manage-thesis") {
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

          displayInfoMessage("Committee invited successfully!", form, "green");
        } catch (error) {
          console.error("Error inviting committee members:", error);
          displayInfoMessage(
            "Error inviting committee members. Please try again.",
            form,
            "red"
          );
        }
      }

      // Examination Details Form
      if (formId === "examination-details-form") {
        const draftFile = document.getElementById("thesis-draft").files[0];
        const additionalLinks =
          document.getElementById("additional-links").value;
        const examDate = document.getElementById("exam-date").value;
        const examDetails = document.getElementById("exam-details").value;
        const libraryLink = document.getElementById("library-link").value;

        if (!draftFile) {
          displayInfoMessage("Please provide a draft file.", form, "orange");
          return;
        }

        try {
          const formData = new FormData();
          formData.append("draft", draftFile);
          formData.append("additional_links", additionalLinks);
          formData.append("exam_date", examDate);
          formData.append("exam_details", examDetails);
          formData.append("library_link", libraryLink);

          const payload = {
            additional_links: additionalLinks,
            exam_date: examDate,
            exam_details: examDetails,
            library_link: libraryLink,
          };

          await fetch(
            `http://localhost:5000/theses/${student_thesis_id}/material`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: formData,
            }
          );

          displayInfoMessage(
            "Examination details submitted successfully!",
            form,
            "green"
          );
        } catch (error) {
          console.error("Error submitting examination details:", error);
          displayInfoMessage(
            "Error submitting details. Please try again.",
            form,
            "red"
          );
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

        const response_data = await response.json();

        if (!response.ok) {
          displayInfoMessage(
            response_data.error || "Failed to create thesis topic",
            form,
            "red"
          );
          throw new Error("Failed to create thesis topic");
        }

        displayInfoMessage("Thesis topic created successfully!", form, "green");
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

        const newThesis = await response.json();
        if (!response.ok) {
          displayInfoMessage(
            newThesis.error || "Failed to update thesis topic",
            form,
            "red"
          );
          throw new Error("Failed to update thesis topic");
        }

        displayInfoMessage("Thesis topic updated successfully!", form, "green");
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
          displayInfoMessage(
            response_data.error || "Failed to assign topic to student",
            form,
            "red"
          );
          throw new Error("Failed to assign topic to student");
        }

        displayInfoMessage(
          "Thesis topic assigned successfully!",
          form,
          "green"
        );
      }
    }
  });
});
