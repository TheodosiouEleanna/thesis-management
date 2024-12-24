const showInfoMessage = (messageText, buttonClass) => {
  // Find or create the info container div
  de;
  let infoDiv = document.getElementById("infoContainer");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.id = "infoContainer";
    infoDiv.style.color = "green";
    infoDiv.style.marginTop = "10px";

    // Find the submit button and insert the info div before it
    const submitButton = document.querySelector(buttonClass);
    if (submitButton) {
      submitButton.insertAdjacentElement("beforebegin", infoDiv);
    }

    // infoDiv.textContent = "Thesis topic created successfully!";
    //     setTimeout(() => {
    //       infoDiv.style.display = "none";
    //     }, 4000);
  }
};

export { showInfoMessage };
