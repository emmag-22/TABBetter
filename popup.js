const API_KEY = "AIzaSyDm8y9wul_FhQdcICrEznB77Tjm9HF2XO4"; // Paste secret API key here

document.getElementById('groupBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.innerText = "Analyzing tabs...";

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabData = tabs.map(t => ({ id: t.id, title: t.title }));

    // UPDATED MODEL: Use gemini-2.5-flash instead of retired versions
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Group these chrome tabs into logical categories. Return ONLY a JSON array of objects: [{"name": "Category", "color": "blue", "tabIds": [1, 2]}]. Tabs: ${JSON.stringify(tabData)}` }] }]
      })
    });

    const data = await response.json();
    
    // Check for API errors (like 404 or 401)
    if (data.error) {
      throw new Error(`API Error ${data.error.code}: ${data.error.message}`);
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();
    const groups = JSON.parse(cleanJson);

    for (const group of groups) {
      const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
      await chrome.tabGroups.update(groupId, { title: group.name, color: group.color });
    }

    status.innerText = "Done!";
  } catch (error) {
    status.innerText = "Error! Check the console.";
    console.error("Extension Error:", error);
  }
});