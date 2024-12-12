const menuContainer = document.getElementById("role-specific-menu");
const user = JSON.parse(localStorage.getItem("user"));
let student_thesis_id;
let available_committees;
const sections = [
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
        <p><u>Topic:</u> <strong>${data.title}</strong></p>
        <p><u>Description:</u> ${data.description}</p>
        <p><u>Attachment:</u> <a href="${data.detailed_file}" target="_blank">Download Description File</a></p>
        <p><u>Status:</u> <strong>${data.status}</strong></p>
        <p><u>Three-Member Committee:</u> <strong>${data.committees[0].name}</strong>, ${data.committees[1].name}, ${data.committees[2].name}</p>
        <p><u>Time Elapsed:</u> <strong>${data.time_elapsed}</strong></p>
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
          <label for="address">Full Postal Address:</label>
          <input type="text" id="address" value="${data.contact_details.address}" />

          <label for="email">Contact Email:</label>
          <input type="email" id="email" value="${data.email}" />

          <label for="mobile">Mobile Phone:</label>
          <input type="text" id="mobile" value="${data.contact_details.mobile}" />

          <label for="landline">Landline Phone:</label>
          <input type="text" id="landline" value="${data.contact_details.phone}" />

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
      if (!thesis_response.ok) throw new Error("Failed to fetch thesis data");

      const thesis = await thesis_response.json();
      student_thesis_id = thesis.id;

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

      debugger;
      const dateStr = thesis_material.exam_date;

      // Convert to compatible value for datetime-local input
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toISOString().slice(0, 16); // "2024-11-28T14:49"

      if (thesis.status === "under_assignment") {
        return `<div class="thesis-work">
          <h4>Your Thesis is: Under Assignment</h4>
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

// Dynamically construct sections with fetch-on-expand behavior
sections.forEach(({ title, fetchData }) => {
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

menuContainer.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log(event.target);
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
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update profile data");

      let infoDiv = document.getElemnetById("infoContainer");
      if (!infoDiv) {
        // Create a div for the message if it doesn't exist
        infoDiv = document.createElement("div");
        infoDiv.id = "infoContainer";
        infoDiv.style.color = "green";
        infoDiv.style.marginTop = "10px";

        // Insert the error message div below the input fields
        const saveButton = document.getElementById("save-profile-button");
        form.insertBefore(infoDiv, saveButton);
        infoDiv.textContent = "Profile updated successfully!";
      }

      setTimeout(() => {
        infoDiv.style.display = "none";
      }, 4000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile. Please try again.");
    }
  }

  if (event.target && event.target.id === "manage-thesis") {
    const form = event.target;
    const selectedOptions = Array.from(
      document.getElementById("committee-members").selectedOptions
    ).map((option) => option);

    const selectedCommittees = available_committees.filter((committee) => {
      return selectedOptions.some((option) => option.value === committee.name);
    });

    const payload = selectedCommittees.map((committee) => {
      return {
        user_role: committee.role,
        user_id: committee.member_id,
        thesis_id: student_thesis_id,
      };
    });

    try {
      const response = await fetch(`http://localhost:5000/committees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to invite committee members");

      let infoDiv = document.getElementById("infoContainer");
      if (!infoDiv) {
        // Create a div for the message if it doesn't exist
        infoDiv = document.createElement("div");
        infoDiv.id = "infoContainer";
        infoDiv.style.color = "green";
        infoDiv.style.marginTop = "10px";

        // Insert the error message div below the input fields
        const saveButton = document.getElementById("add-members-button");
        form.insertBefore(infoDiv, saveButton);
        infoDiv.textContent = "Committee invited successfully!";
      }

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
        `http://localhost:5000/theses/${student_thesis_id}/invited-members`,
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

      const invited_members_new = await invited_members_response.json();

      const members_container = document.getElementById("committee-members");
      if (!members_container) {
        console.error("Available members container not found!");
        return;
      }

      const invited_container = document.getElementById(
        "invited-members-container"
      );
      if (!invited_container) {
        console.error("Invited members container not found!");
        return;
      }

      const new_available = available_committees
        .map((member) => `<option>${member.name}</option>`)
        .join("");

      // Generate new HTML for the invited members
      const new_invited = invited_members_new
        .map(
          (member) => `
          <div class="invited-member-card">
            <img src="https://img.icons8.com/ios-filled/50/4caf50/invitation.png" alt="Invitation Icon" class="invitation-icon">
            <span class="member-name">${member.name} is invited</span>
          </div>
          `
        )
        .join("");

      // Update the container's content
      members_container.innerHTML = new_available;
      invited_container.innerHTML = new_invited;

      setTimeout(() => {
        infoDiv.style.display = "none";
      }, 4000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile. Please try again.");
    }
  }
  if (event.target && event.target.id === "examination-details-form") {
    const form = event.target;

    // Extract inputs
    const draftFile = document.getElementById("thesis-draft").files[0];
    const additionalLinks = document.getElementById("additional-links").value;
    const examDate = document.getElementById("exam-date").value;
    const examDetails = document.getElementById("exam-details").value;
    const libraryLink = document.getElementById("library-link").value;

    // Validate inputs
    if (!draftFile) {
      let infoDiv = document.getElementById("infoContainer");
      if (!infoDiv) {
        // Create a div for the message if it doesn't exist
        infoDiv = document.createElement("div");
        infoDiv.id = "infoContainer";
        infoDiv.style.color = "orange";
        infoDiv.style.marginTop = "10px";

        // Insert the error message div below the input fields
        const examDetailsButton = document.getElementById(
          "submit-exam-details"
        );
        form.insertBefore(infoDiv, examDetailsButton);
        infoDiv.textContent = "Please provide a draft file.";
      }
    }

    if (!response.ok) throw new Error("Failed to invite committee members");

    try {
      // Upload the draft file
      const formData = new FormData();
      formData.append("draft", draftFile);

      const uploadResponse = await fetch(
        `http://localhost:5000/theses/${student_thesis_id}/upload-draft`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) throw new Error("Failed to upload thesis draft");

      // Submit examination details
      const payload = {
        additional_links: additionalLinks,
        exam_date: examDate,
        exam_details: examDetails,
        library_link: libraryLink,
      };

      const response = await fetch(
        `http://localhost:5000/theses/${student_thesis_id}/examination-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit examination details");

      // Notify success
      let infoDiv = document.getElementById("infoContainer");
      if (!infoDiv) {
        infoDiv = document.createElement("div");
        infoDiv.id = "infoContainer";
        infoDiv.style.color = "green";
        infoDiv.style.marginTop = "10px";
        form.insertAdjacentElement("beforeend", infoDiv);
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
});
