const button = document.getElementById("organize");
const status = document.getElementById("status");

button.addEventListener("click", () => {
  status.textContent = "Analyzing tabs…";

  chrome.runtime.sendMessage(
    { action: "ORGANIZE_TABS" },
    () => {
      status.textContent = "Done!";
      setTimeout(() => window.close(), 500);
    }
  );
});
