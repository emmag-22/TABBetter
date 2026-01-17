const splash = document.getElementById("splash");
const app = document.getElementById("app");
const status = document.getElementById("status");

// Splash screen animation: hide after 1.2s
setTimeout(() => {
  splash.style.display = "none";
  app.classList.remove("hidden");
}, 1200);

// Organize Tabs button
document.getElementById("organize").addEventListener("click", () => {
  status.textContent = "Extracting tabs...";

  // Step 1: ask background script to inject content scripts into all tabs
  chrome.runtime.sendMessage({ type: "EXTRACT_TABS" }, (res) => {
    if (res?.status === "done") {
      status.textContent = "Sending data to backend...";

      // Step 2: ask background script to send collected tab info to backend
      chrome.runtime.sendMessage({ type: "SEND_BACKEND" }, (res2) => {
        status.textContent = "Tabs sent to backend!";
      });
    }
  });
});
