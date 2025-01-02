const announcementContainer = document.getElementById("announcement-container");

// Example fetch function to get data (replace with your actual API endpoint)
const fetchAnnouncements = async (timeRange) => {
  const response = await fetch(
    `http://localhost:5000/announcements?timeRange=${timeRange}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch announcements");
  }
  const data = await response.json(); // Or XML based on your API response
  return `
    <ul class="announcement-list">
  ${data
    .map(
      (item) =>
        `
      <div id="announcement-container-${
        item.id
      }" class="announcement-container">
        <div id="announcement-list-item">
          <li>
            <strong>${item.title}</strong>
            <br />
            <span>
              Date:
            </span>
            ${new Date(item.presentation_date)
              .toString()
              .split("GMT")[0]
              .trim()}
            <br />
            <p>
              ${item.content}
            </p>
          </li>
        </div>
      </div>
      `
    )
    .join("")}
</ul>`;
};

// Function to create the announcement section with a dropdown
const createAnnouncementSectionWithDropdown = (title) => {
  const section = document.createElement("div");
  section.classList.add("menu-section");

  const header = document.createElement("div");
  header.classList.add("menu-header");
  header.innerHTML = `<span>${title}</span>`;

  const body = document.createElement("div");
  body.classList.add("menu-body");

  // Dropdown for selecting the time range
  const dropdown = document.createElement("select");
  dropdown.innerHTML = `
    <option value="past_week">Past Week</option>
    <option value="past_month">Past Month</option>
    <option value="past_year">Past Year</option>
  `;

  const contentContainer = document.createElement("div");
  contentContainer.innerHTML =
    "<p>Select a time range to load announcements.</p>";

  // Event listener for dropdown change
  dropdown.addEventListener("change", async () => {
    try {
      contentContainer.innerHTML = "<p>Loading...</p>";
      const timeRange = dropdown.value;
      const content = await fetchAnnouncements(timeRange);
      contentContainer.innerHTML = content;
    } catch (error) {
      console.error(`Error loading announcements:`, error);
      contentContainer.innerHTML = `<p>${error.message}</p>`;
    }
  });

  body.appendChild(dropdown);
  body.appendChild(contentContainer);
  section.appendChild(header);
  section.appendChild(body);
  announcementContainer.appendChild(section);
};

// Add the announcement section with a dropdown
createAnnouncementSectionWithDropdown("Announcements");
