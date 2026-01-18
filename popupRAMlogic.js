// Make sure your HTML has:
// <div id="tabContainer"></div>
// <p id="status"></p>

const tabContainer = document.getElementById("tabContainer");
const status = document.getElementById("status");

// Main function to populate the RAM workspace
async function populateTabs() {
  try {
    status.textContent = "Loading tabs...";
    
    // 1. Get all tabs in the current window
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // 2. Get memory info using the processes API
    const processes = await chrome.processes.getProcessInfo(
      tabs.map(t => t.id),
      true
    );

    // 3. Map tabs with memory usage
    const tabData = tabs.map(tab => {
      const process = processes.find(p => p.tabs.includes(tab.id));
      return {
        id: tab.id,
        title: tab.title,
        memory: process ? process.privateMemory : 0
      };
    });

    // 4. Clear the container before rendering
    tabContainer.innerHTML = "";

    if (tabData.length === 0) {
      tabContainer.textContent = "No open tabs found.";
      status.textContent = "";
      return;
    }

    // 5. Render each tab as a row
    tabData.forEach(tab => {
      const div = document.createElement("div");
      div.className = "tab-row"; // matches front-end CSS
      div.innerHTML = `
        <span class="tab-title">${tab.title}</span>
        <span class="tab-memory">${(tab.memory / (1024*1024)).toFixed(1)} MB</span>
        <button class="close-tab" data-tab-id="${tab.id}">✕</button>
      `;
      tabContainer.appendChild(div);
    });

    // 6. Attach close functionality to each button
    document.querySelectorAll(".close-tab").forEach(btn => {
      btn.addEventListener("click", async e => {
        const tabId = parseInt(e.target.dataset.tabId);
        await chrome.tabs.remove(tabId);        // close tab
        populateTabs();                          // refresh the list dynamically
      });
    });

    status.textContent = "Tabs loaded.";
  } catch (err) {
    console.error(err);
    status.textContent = `Error: ${err.message}`;
  }
}

// Initial render: call this on load or on "organize" button click
populateTabs();

// Optional: you can also expose this function for front-end buttons
// window.populateTabs = populateTabs;
