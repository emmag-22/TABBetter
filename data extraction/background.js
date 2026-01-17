// Store tab data
const pageDataByTab = {};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "PAGE_INFO") {
    const tabId = sender.tab.id;
    pageDataByTab[tabId] = msg.payload;
  }
});

// Extract tabs when popup is opened
async function extractAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url || tab.pinned) continue;

    // Inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    } catch (err) {
      console.warn(`Cannot inject into tab ${tab.id}:`, err);
    }
  }
}

// Send collected data to backend
async function sendToBackend() {
  const payload = {
    tabs: Object.entries(pageDataByTab).map(([tabId, data]) => ({
      id: Number(tabId),
      ...data
    }))
  };

  try {
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
