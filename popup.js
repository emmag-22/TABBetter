const splash = document.getElementById("splash");
const app = document.getElementById("app");
const status = document.getElementById("status");

setTimeout(() => {
  splash.style.display = "none";
  app.classList.remove("hidden");
}, 1200);

document.getElementById("organize").addEventListener("click", () => {
  status.textContent = "Organizing tabs...";
});
