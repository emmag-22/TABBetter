const GEMINI_API_KEY = 'AIzaSyDm8y9wul_FhQdcICrEznB77Tjm9HF2XO4';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Listen for the message from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "organize_tabs") {
    organizeTabsWithAI()
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.error(err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep the message channel open for async response
  }
});

async function organizeTabsWithAI() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  
  // Filter out internal chrome:// tabs which can't be grouped easily
  const validTabs = tabs.filter(t => t.url.startsWith('http'));
  const tabData = validTabs.map(t => ({ id: t.id, title: t.title }));
  
  const prompt = `Return a JSON array of groups for these tabs: ${JSON.stringify(tabData)}. 
  Each group must have a "groupName" and an array of "tabIds". 
  Example format: [{"groupName": "News", "tabIds": [1, 2]}]. 
  Output ONLY raw JSON.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  const data = await response.json();
  
  if (!data.candidates) {
    throw new Error("AI response failed. Check your API Key.");
  }

  let rawText = data.candidates[0].content.parts[0].text;
  
  // Clean the response in case Gemini adds markdown code blocks
  const cleanJson = rawText.replace(/```json|```/g, "").trim();
  const groups = JSON.parse(cleanJson);

  for (const group of groups) {
    if (group.tabIds.length > 0) {
      const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
      await chrome.tabGroups.update(groupId, { title: group.groupName });
    }
  }
}

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "GET_TAB_MEMORY") {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const results = [];

    for (const tab of tabs) {
      try {
        const pid = await chrome.processes.getProcessIdForTab(tab.id);
        const info = await chrome.processes.getProcessInfo(pid, true);

        const mb = Math.round(info.privateMemory / 1024 / 1024);

        results.push({
          title: tab.title,
          memory: mb + " MB"
        });
      } catch {
        results.push({
          title: tab.title,
          memory: "N/A"
        });
      }
    }

    sendResponse(results);
  }
  return true;
});
