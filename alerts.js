// alerts.js

function showAlert(type, message) {
    const alertBox = document.createElement("div");
    alertBox.className = `alert-box ${type}`;
    alertBox.innerHTML = `
      <strong>${type.toUpperCase()}:</strong> ${message}
      <span class="close-btn" onclick="this.parentElement.remove();">&times;</span>
    `;
    document.body.appendChild(alertBox);
  
    // Auto-remove after 5s
    setTimeout(() => alertBox.remove(), 5000);
  }
  
  async function pollForAlerts() {
    try {
      const response = await fetch("http://127.0.0.1:5000/getAlerts");
      const alerts = await response.json();
  
      alerts.forEach(alert => {
        showAlert("danger", `Weapon Detected: ${alert.weapon} at ${alert.location}`);
        if (getSoundSetting() === "on") {
          playAlertSound();
        }
      });
    } catch (error) {
      console.error("Polling error:", error);
    }
  }
  
  // Poll every 5 seconds
  setInterval(pollForAlerts, 5000);
  
  function playAlertSound() {
    const audio = new Audio("/assets/alert.mp3");
    audio.play();
  }
  
  function getSoundSetting() {
    return localStorage.getItem("sound") || "on";
  }
  