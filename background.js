const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const MAX_ACTIVE_GROUPS = 2;

let groupHistory = [];

const VALID_COLORS = [
  "grey", "blue", "red", "yellow",
  "green", "pink", "purple", "cyan", "orange"
];

// -------------------- TAB ORGANIZATION --------------------

async function organizeTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  if (!tabs.length) return;

  const tabData = tabs.map(t => ({
    id: t.id,
    title: t.title,
    url: t.url
  }));

  const prompt = `
Group these Chrome tabs logically.

Return ONLY valid JSON:
{
  "groups": [
    { "name": "Study", "color": "blue", "tabIds": [1,2] }
  ]
}

Allowed colors: ${VALID_COLORS.join(", ")}

Tabs:
${JSON.stringify(tabData, null, 2)}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No Gemini output");

    const result = JSON.parse(rawText);

    for (const group of result.groups) {
      if (!group.tabIds?.length) continue;

      const validTabIds = await checkValidTabs(group.tabIds);
      if (!validTabIds.length) continue;

      const color = VALID_COLORS.includes(group.color)
        ? group.color
        : "grey";

      const groupId = await chrome.tabs.group({ tabIds: validTabIds });
      await chrome.tabGroups.update(groupId, {
        title: group.name.slice(0, 15),
        color
      });

      handleGroupSwitch(groupId);
    }

    console.log("✅ Tabs organized");
  } catch (e) {
    console.error("❌ Organize error:", e);
  }
}

async function checkValidTabs(ids) {
  const allTabs = await chrome.tabs.query({});
  const existing = new Set(allTabs.map(t => t.id));
  return ids.filter(id => existing.has(id));
}

// -------------------- SMART SUSPENSION --------------------

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      handleGroupSwitch(tab.groupId);
    }
  } catch {}
});

function handleGroupSwitch(groupId) {
  groupHistory = groupHistory.filter(id => id !== groupId);
  groupHistory.unshift(groupId);

  if (groupHistory.length > MAX_ACTIVE_GROUPS) {
    const toSuspend = groupHistory.slice(MAX_ACTIVE_GROUPS);
    groupHistory = groupHistory.slice(0, MAX_ACTIVE_GROUPS);
    toSuspend.forEach(suspendEntireGroup);
  }
}

async function suspendEntireGroup(groupId) {
  try {
    const tabs = await chrome.tabs.query({ groupId });
    for (const tab of tabs) {
      if (
        !tab.active &&
        !tab.pinned &&
        !tab.audible &&
        !tab.discarded &&
        tab.status === "complete"
      ) {
        await chrome.tabs.discard(tab.id);
      }
    }
  } catch {
    console.warn("Group gone:", groupId);
  }
}

chrome.tabGroups.onRemoved.addListener(group => {
  groupHistory = groupHistory.filter(id => id !== group.id);
});

// -------------------- MESSAGING --------------------

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "ORGANIZE_TABS") organizeTabs();
  if (msg.action === "NEW_GROUP") handleGroupSwitch(msg.groupId);
  return true;
});
