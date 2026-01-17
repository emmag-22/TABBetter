// Runs when program is installed 
chrome.runtime.onInstalled.addListener(() => {
  console.log("TABBetter installed");
});

// Store tab data
const pageDataByTab = {};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "PAGE_INFO" && sender.tab?.id != null) {
    const tabId = sender.tab.id;
    pageDataByTab[tabId] = msg.payload;
  }
});

// Extract tabs when popup asks
async function extractAllTabs() {
  // Get all tabs in the current window
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Filter out tabs we cannot access
  const normalTabs = tabs.filter(
    tab => tab.url && tab.url.startsWith("http") && !tab.pinned
  );

  for (const tab of normalTabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } catch (e) {
      console.warn("Could not inject into tab:", tab.id, e.message);
    }
  }

  console.log("Extraction complete for tabs:", normalTabs.map(t => t.id));
}

// Send collected data to backend (mock if needed)
async function sendToBackend() {
  const payload = {
    tabs: Object.entries(pageDataByTab).map(([tabId, data]) => ({
      id: Number(tabId),
      ...data
    }))
  };

  try {
    // For testing, you can comment this out if backend is not ready
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log("Backend grouping result:", result);
  } catch (err) {
    console.error("Failed to send to backend:", err);
  }
}

// Expose functions to popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_TABS") {
    extractAllTabs().then(() => sendResponse({ status: "done" }));
    return true; // keep channel open
  }
  if (msg.type === "SEND_BACKEND") {
    sendToBackend().then(() => sendResponse({ status: "done" }));
    return true;
  }
});
