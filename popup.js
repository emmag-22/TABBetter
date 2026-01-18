const API_KEY = "AIzaSyCNGaXohesBGrr9lGqOT1nFNpCPRV_4s-A"; // Paste secret API key here

/* =========================
   AI TAB GROUPING
========================= */

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
      await chrome.tabGroups.update(groupId, {
        title: group.name,
        color: group.color
      });
    }

    status.innerText = "Done!";
  } catch (error) {
    status.innerText = "Error! Check console.";
    console.error("Extension Error:", error);
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

document.addEventListener('DOMContentLoaded', () => {
  const memoryBtn = document.getElementById('memoryBtn');
  const memoryPage = document.getElementById('memoryPage');
  const closeMemory = document.getElementById('closeMemory');
  const ramList = document.getElementById('ramList');

  memoryBtn.addEventListener('click', async () => {
    memoryPage.style.display = 'block';
    ramList.innerHTML = "Calculating memory...";

    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });

      const memoryData = tabs.map(tab => ({
        title: tab.title || "New Tab",
        memory: estimateTabMemory(tab)
      }));

      ramList.innerHTML = memoryData.map(item => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:13px">
          <span style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${item.title}
          </span>
          <b style="color:#1a73e8;">
            ${item.memory} MB
          </b>
        </div>
      `).join('') + `
        <p style="font-size:11px; color:#888; margin-top:8px;">
          Estimated memory usage (Chrome does not expose exact per-tab RAM)
        </p>
      `;
    } catch (err) {
      console.error(err);
      ramList.innerHTML = "Error calculating memory.";
    }
  });

  closeMemory.addEventListener('click', () => {
    memoryPage.style.display = 'none';
  });
});

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
