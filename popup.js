const organizeBtn = document.getElementById("organizeBtn");
const memoryBtn = document.getElementById("memoryBtn");

let isOrganizing = false;

organizeBtn.addEventListener("click", () => {
  if (isOrganizing) return;

  isOrganizing = true;
  organizeBtn.disabled = true;
  organizeBtn.querySelector("span").textContent = "Organizing...";

  // Simulate organizing
  setTimeout(() => {
    isOrganizing = false;
    organizeBtn.disabled = false;
    organizeBtn.querySelector("span").textContent = "Organize Tabs";
  }, 2000);
});

memoryBtn.addEventListener("click", () => {
  console.log("Saving memory space...");
});
