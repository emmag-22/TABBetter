const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const MAX_ACTIVE_GROUPS = 2; 
let groupHistory = [];

// --- 1. TABS ORGANIZATION LOGIC (GEMINI) ---
async function organizeTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  
  const tabData = tabs.map(tab => ({
    id: tab.id,
    title: tab.title,
    url: tab.url
  }));

  const prompt = `
    Analyze these Chrome tabs and group them into logical categories.
    For each category, provide a short 1-2 word name and a color: 
    grey, blue, red, yellow, green, pink, purple, cyan, orange.
    Tabs: ${JSON.stringify(tabData)}
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: {
            type: "object",
            properties: {
              groups: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    color: { type: "string" },
                    tabIds: { type: "array", items: { type: "integer" } }
                  }
                }
              }
            }
          }
        }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

    for (const group of result.groups) {
      if (group.tabIds.length > 0) {
        const validTabIds = await checkValidTabs(group.tabIds);
        if (validTabIds.length > 0) {
          const groupId = await chrome.tabs.group({ tabIds: validTabIds });
          await chrome.tabGroups.update(groupId, {
            title: group.name,
            color: group.color
          });
          // Track the newly created group as "Active"
          handleGroupSwitch(groupId);
        }
      }
    }
    console.log("Organization Complete");
  } catch (error) {
    console.error("AI Org Error:", error);
  }
}

async function checkValidTabs(ids) {
  const allTabs = await chrome.tabs.query({});
  const existingIds = allTabs.map(t => t.id);
  return ids.filter(id => existingIds.includes(id));
}

// --- 2. RAM SUSPENSION LOGIC ---
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
            handleGroupSwitch(tab.groupId);
        }
    } catch (e) { console.error(e); }
});

async function handleGroupSwitch(newGroupId) {
    // Logic: Move current group to the top of history
    groupHistory = groupHistory.filter(id => id !== newGroupId);
    groupHistory.unshift(newGroupId);

    // If we exceed the limit, suspend the oldest groups
    if (groupHistory.length > MAX_ACTIVE_GROUPS) {
        const groupsToSuspend = groupHistory.slice(MAX_ACTIVE_GROUPS);
        groupHistory = groupHistory.slice(0, MAX_ACTIVE_GROUPS);
        groupsToSuspend.forEach(id => suspendEntireGroup(id));
    }
}

async function suspendEntireGroup(groupId) {
    try {
        const tabs = await chrome.tabs.query({ groupId: groupId });
        tabs.forEach(tab => {
            // Only discard if tab is not active, audible, or pinned
            if (!tab.active && !tab.audible && !tab.pinned) {
                chrome.tabs.discard(tab.id);
            }
        });
    } catch (e) { console.warn("Group missing during suspension."); }
}

// Clean up history when groups are manually closed
chrome.tabGroups.onRemoved.addListener((group) => {
    groupHistory = groupHistory.filter(id => id !== group.id);
});

// --- 3. UNIFIED COMMUNICATION LISTENER ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ORGANIZE_TABS") {
    organizeTabs();
  } else if (message.action === "NEW_GROUP") {
    handleGroupSwitch(message.groupId);
  }
  // Essential for MV3 to keep the message channel open if needed
  return true; 
});