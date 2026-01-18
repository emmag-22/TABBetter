const tabList = document.getElementById("tabList");
const status = document.getElementById("status");

async function showTopRamTabs() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    const processes = await chrome.processes.getProcessInfo(
      tabs.map(t => t.id),
      true
    );

    const tabMemoryData = tabs.map(tab => {
      const process = processes.find(p => p.tabs.includes(tab.id));
      return {
        id: tab.id,
        title: tab.title,
        memory: process ? process.privateMemory : 0
      };
    });

    const top5 = tabMemoryData.sort((a, b) => b.memory - a.memory).slice(0, 5);

    tabList.innerHTML = "";
    if (top5.length === 0) tabList.textContent = "No tabs found";

    top5.forEach(t => {
      const div = document.createElement("div");
      div.className = "tab-item";
      div.innerHTML = `
        <span class="tab-title">${t.title}</span>
        <span class="tab-memory">${(t.memory / (1024*1024)).toFixed(1)} MB</span>
        <button class="close-tab" data-tab-id="${t.id}">✕</button>
      `;
      tabList.appendChild(div);
    });

    document.querySelectorAll(".close-tab").forEach(btn => {
      btn.addEventListener("click", async e => {
        const tabId = parseInt(e.target.dataset.tabId);
        await chrome.tabs.remove(tabId);
        showTopRamTabs(); // Refresh after closing
      });
    });

    status.textContent = "";
  } catch (err) {
    console.error(err);
    status.textContent = `Error: ${err.message}`;
  }
}

showTopRamTabs();
