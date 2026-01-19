const API_KEY = "AIzaSyBLxybnjLIqtYV7RCsjaVwmwAimzaHdndQ"; // Paste secret API key here

/* =========================
   AI TAB GROUPING
========================= */

const statusText = document.getElementById("statusText");
const spinner = document.getElementById("statusSpinner");


document.getElementById('groupBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.innerText = "Analyzing tabs...";

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabData = tabs.map(t => ({ id: t.id, title: t.title }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Group these chrome tabs into logical categories. 
            Rules:
- Category names must be SHORT (1–2 words max)
- Prefer simple nouns
- No "&", "and", or long phrases
- Examples: "School", "News", "Shopping", "Media", "Work"
Return ONLY a JSON array of objects:
[{"name":"Category","color":"blue","tabIds":[1,2]}].
Tabs: ${JSON.stringify(tabData)}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`API Error ${data.error.code}: ${data.error.message}`);
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();
    const groups = JSON.parse(cleanJson);

    for (const group of groups) {
      const groupId = await chrome.tabs.group({ tabIds: group.tabIds });

      function normalizeGroupColor(color) {
        const allowed = [
          "blue",
          "cyan",
          "green",
          "grey",
          "orange",
          "pink",
          "purple",
          "red",
          "yellow"
        ];
      
        if (!color) return "blue";
      
        const c = color.toLowerCase();
      
        if (allowed.includes(c)) return c;
      
        // Smart fallbacks for AI colors
        if (c.includes("teal") || c.includes("mint") || c.includes("aqua")) return "cyan";
        if (c.includes("emerald")) return "green";
        if (c.includes("violet")) return "purple";
        if (c.includes("rose")) return "pink";
      
        return "blue"; // safe default
      }
      

      await chrome.tabGroups.update(groupId, {
        title: group.name,
        color: normalizeGroupColor(group.color)
      });
      
    }

    status.innerText = "Done!";
  } catch (error) {
    status.innerText = "Error! Check console.";
    console.error("Extension Error:", error);
    spinner.classList.add("hidden");
    statusText.textContent = "Error. Check console.";

  }
});

/* =========================
   UNGROUP ALL
========================= */

document.getElementById('ungroupBtn').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabIds = tabs.map(t => t.id);
    if (tabIds.length) await chrome.tabs.ungroup(tabIds);
  } catch (error) {
    console.error("Ungroup failed:", error);
  }
});

/* =========================
   MEMORY MANAGER (ESTIMATED)
========================= */

function loadMemoryManager() {
  const ramList = document.getElementById('ramList');
  ramList.innerHTML = "Calculating memory...";

  chrome.tabs.query({ currentWindow: true }).then(tabs => {
    const memoryData = tabs.map(tab => ({
      title: tab.title || "New Tab",
      memory: estimateTabMemory(tab)
    }));

    memoryData.sort((a, b) => b.memory - a.memory);

    ramList.innerHTML = memoryData.map(item => `
      <div class="ram-item">
        <div class="ram-title">${item.title}</div>
        <div class="ram-size">${item.memory} MB</div>
      </div>
    `).join("");
  });
}


/* =========================
   MEMORY ESTIMATION LOGIC
========================= */

function estimateTabMemory(tab) {
  let mb = 35; // baseline

  const url = tab.url || "";

  if (url.includes("youtube.com")) mb += 250;
  if (url.includes("netflix.com")) mb += 350;
  if (url.includes("spotify.com")) mb += 150;

  if (url.includes("docs.google.com")) mb += 120;
  if (url.includes("notion.so")) mb += 140;
  if (url.includes("figma.com")) mb += 200;

  if (tab.audible) mb += 80;
  if (tab.discarded) mb = 5;

  return mb;
}

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const app = document.getElementById("app");
  const butterfly = document.querySelector(".butterfly");

  if (!splash || !app || !butterfly) return;

  // Ensure main app is hidden initially
  app.classList.add("hidden");

  // When the butterfly animation finishes → show app
  butterfly.addEventListener("animationend", () => {
    // Delay AFTER animation finishes
    setTimeout(() => {
      splash.classList.add("hidden");
      app.classList.remove("hidden");
    }, 800); // 👈 delay in milliseconds
  });
  
});

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  // show splash first
  showScreen("splash");

  // wait for animation + extra delay
  setTimeout(() => {
    showScreen("app");
  }, 1800); // <-- adjust delay here
});

document.getElementById("memoryBtn").addEventListener("click", () => {
  showScreen("memoryPage");
  loadMemoryManager(); // your existing logic
});

document.getElementById("closeMemory").addEventListener("click", () => {
  showScreen("app");
});

status.style.opacity = 0;
setTimeout(() => {
  const statusText = document.getElementById("statusText");
  const spinner = document.getElementById("statusSpinner");

  statusText.textContent = "Analyzing tabs";
  spinner.classList.remove("hidden");


  status.style.opacity = 1;
}, 150);

statusText.textContent = "Done!";
spinner.classList.add("hidden");


console.log("Spinner element:", spinner);

