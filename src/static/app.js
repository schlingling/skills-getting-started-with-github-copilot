document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const detailsDialog = document.getElementById("activity-details-dialog");
  const detailsTitle = document.getElementById("activity-details-title");
  const detailsDescription = document.getElementById("activity-details-description");
  const detailsLocation = document.getElementById("activity-details-location");
  const detailsSupervisor = document.getElementById("activity-details-supervisor");
  const detailsCloseButton = document.getElementById("activity-details-close");
  let detailsTrigger = null;

  function openActivityDetails(name, details, trigger) {
    detailsTitle.textContent = name;
    detailsDescription.textContent = details.extended_description;
    detailsLocation.textContent = details.location;
    detailsSupervisor.textContent = details.supervisor;
    detailsTrigger = trigger;
    document.body.classList.add("dialog-open");
    detailsDialog.showModal();
    detailsCloseButton.focus();
  }

  function closeActivityDetails() {
    detailsDialog.close();
  }

  detailsCloseButton.addEventListener("click", closeActivityDetails);

  detailsDialog.addEventListener("click", (event) => {
    if (event.target === detailsDialog) {
      closeActivityDetails();
    }
  });

  detailsDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    detailsTrigger?.focus();
    detailsTrigger = null;
  });

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        activityCard.addEventListener("click", () => {
          openActivityDetails(name, details, activityCard);
        });

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = `Participants (${details.participants.length})`;
        participantsSection.appendChild(participantsHeading);

        if (details.participants.length > 0) {
          const participantsList = document.createElement("ul");
          details.participants.forEach((participant) => {
            const participantItem = document.createElement("li");

            const participantEmail = document.createElement("span");
            participantEmail.textContent = participant;
            participantItem.appendChild(participantEmail);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "participant-delete";
            deleteButton.innerHTML = "&times;";
            deleteButton.setAttribute("aria-label", `Unregister ${participant} from ${name}`);
            deleteButton.title = `Unregister ${participant}`;
            deleteButton.addEventListener("click", async (event) => {
              event.stopPropagation();
              deleteButton.disabled = true;

              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(participant)}`,
                  { method: "DELETE" }
                );
                const result = await response.json();

                messageDiv.textContent = response.ok
                  ? result.message
                  : result.detail || "An error occurred";
                messageDiv.className = response.ok ? "success" : "error";
                messageDiv.classList.remove("hidden");

                if (response.ok) {
                  await fetchActivities();
                } else {
                  deleteButton.disabled = false;
                }
              } catch (error) {
                messageDiv.textContent = "Failed to unregister participant. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                deleteButton.disabled = false;
                console.error("Error unregistering participant:", error);
              }
            });

            participantItem.appendChild(deleteButton);
            participantsList.appendChild(participantItem);
          });
          participantsSection.appendChild(participantsList);
        } else {
          const emptyMessage = document.createElement("p");
          emptyMessage.className = "participants-empty";
          emptyMessage.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(emptyMessage);
        }

        activityCard.appendChild(participantsSection);

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.className = "activity-details-trigger";
        detailsButton.textContent = "View details";
        detailsButton.setAttribute("aria-label", `View details for ${name}`);
        detailsButton.addEventListener("click", (event) => {
          event.stopPropagation();
          openActivityDetails(name, details, detailsButton);
        });
        activityCard.appendChild(detailsButton);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
