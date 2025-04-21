function setDnsAsCookie(dns) {
    let date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    document.cookie = `dns=${dns}; path=/; expires=${date.toUTCString()}`;
  }
  
  function getDnsFromCookie() {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("dns="))
      ?.split("=")[1];
  }
  
  async function fetchToServer(dns, userId, password) {
    try {
      const response = await fetch("http://127.0.0.1:5000/getToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dns, userId, password }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        localStorage.setItem("token", result.token);
        document.getElementById("statusMsg").style.color = "#00ff99";
        document.getElementById("statusMsg").textContent = "✅ Login successful. Redirecting...";
        setTimeout(() => window.location.href = "/dashboard.html", 1500);
      } else {
        document.getElementById("statusMsg").textContent = "❌ " + (result.message || "Login failed.");
      }
    } catch (err) {
      document.getElementById("statusMsg").textContent = "❌ Server error.";
    }
  }
  
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const userId = document.getElementById("userId").value;
    const password = document.getElementById("password").value;
  
    setDnsAsCookie("dns");
    const dns = getDnsFromCookie();
  
    fetchToServer(dns, userId, password);
  });
  