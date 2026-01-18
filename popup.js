const API_KEY = "AIzaSyCgnqPy1Coxv9V4pZVeqS_Ybrj9-jRAKIs";

// 1. Organize Tabs Logic
document.getElementById('organizeBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.classList.remove('hidden'); // Show status element
  status.innerText = "✨ Analyzing tabs...";

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabData = tabs.map(t => ({ id: t.id, title: t.title }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Group these chrome tabs into logical categories. Return ONLY a JSON array of objects: [{"name": "Category", "color": "blue", "tabIds": [1, 2]}]. Valid colors: grey, blue, red, yellow, green, pink, purple, cyan, orange. Tabs: ${JSON.stringify(tabData)}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(`API Error ${data.error.code}: ${data.error.message}`);

    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();
    const groups = JSON.parse(cleanJson);

    for (const group of groups) {
      // Filter out invalid IDs just in case
      const validTabIds = group.tabIds.filter(id => typeof id === 'number');
      if (validTabIds.length > 0) {
        const groupId = await chrome.tabs.group({ tabIds: validTabIds });
        await chrome.tabGroups.update(groupId, { title: group.name, color: group.color.toLowerCase() });
      }
    }

    status.innerText = "Tabs organized!";
    setTimeout(() => status.classList.add('hidden'), 3000); // Hide after 3 seconds
  } catch (error) {
    status.innerText = "Error! Check console.";
    console.error("Extension Error:", error);
  }
});

// 2. Save Memory Space Logic
document.getElementById('memoryBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.classList.remove('hidden');
  status.innerText = "💾 Freeing memory...";

  try {
    const tabs = await chrome.tabs.query({ active: false, currentWindow: true });
    
    // Discards inactive tabs to free up RAM
    for (const tab of tabs) {
      await chrome.tabs.discard(tab.id);
    }

    status.innerText = `Memory saved! (${tabs.length} tabs hibernated)`;
    setTimeout(() => status.classList.add('hidden'), 3000);
  } catch (error) {
    status.innerText = "Could not free memory.";
    console.error(error);
  }
});