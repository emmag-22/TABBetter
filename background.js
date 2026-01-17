// Import modules
import { embedText } from "./embed.js";
import { clusterTabs } from "./cluster.js";
import { nameCluster, colorForName } from "./naming.js";

// Runs when program is installed 
chrome.runtime.onInstalled.addListener(() => {
  console.log("TABBetter installed");
});

// Store tab data
const pageDataByTab = {};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "PAGE_INFO" && sender.tab?.id != null) {
    pageDataByTab[sender.tab.id] = msg.payload;
  }

  if (msg.type === "EXTRACT_TABS") {
    await extractAllTabs();
    sendResponse({ status: "done" });
    return true; // keep channel open
  }

  if (msg.type === "SEND_BACKEND") {
    await sendToBackend(); // mock or real
    sendResponse({ status: "done" });
    return true;
  }

  if (msg.type === "ORGANIZE_TABS") {
    // Convert pageDataByTab to array
    const tabs = Object.entries(pageDataByTab).map(([tabId, data]) => ({
      tabId: Number(tabId),
      ...data
    }));

    const clusters = await organizeTabs(tabs);

    // Apply Chrome tabGroups
    for (const cluster of clusters) {
      const groupId = await chrome.tabs.group({ tabIds: cluster.tabs.map(t => t.tabId) });
      await chrome.tabGroups.update(groupId, {
        title: cluster.name,
        color: cluster.color
      });
    }

    sendResponse({ status: "done" });
    return true;
  }
});

// ---------------------
// Extract tabs
// ---------------------
async function extractAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

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

// ---------------------
// Local API for grouping
// ---------------------
async function organizeTabs(tabs) {
  for (const tab of tabs) {
    tab.embedding = await embedText(tab.title + " " + tab.text);
  }

  const clusters = clusterTabs(tabs);

  for (const cluster of clusters) {
    cluster.name = nameCluster(cluster);
    cluster.color = colorForName(cluster.name);
  }

  return clusters;
}

// ---------------------
// Send to backend (mocked for now)
// ---------------------
async function sendToBackend() {
  const payload = {
    tabs: Object.entries(pageDataByTab).map(([tabId, data]) => ({
      id: Number(tabId),
      ...data
    }))
  };

  console.log("Mock sending to backend:", payload);

  // Example mock grouping
  const mockResult = [
    { tabIds: payload.tabs.map(t => t.id), name: "Demo Group", color: "blue" }
  ];

  for (const group of mockResult) {
    const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
    await chrome.tabGroups.update(groupId, { title: group.name, color: group.color });
  }
}
