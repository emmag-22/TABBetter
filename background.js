// CONFIGURATION
const MAX_ACTIVE_GROUPS = 2; // How many groups to keep "warm"
let groupHistory = []; // Tracks the order of group usage

// Listen for when a user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    // If the tab is in a group, process the "Context Switch"
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        handleGroupSwitch(tab.groupId);
    }
});

async function handleGroupSwitch(newGroupId) {
    // 1. Update the History (Move current group to the front)
    groupHistory = groupHistory.filter(id => id !== newGroupId);
    groupHistory.unshift(newGroupId);

    // 2. Identify groups to suspend
    if (groupHistory.length > MAX_ACTIVE_GROUPS) {
        const groupsToSuspend = groupHistory.slice(MAX_ACTIVE_GROUPS);
        
        // Remove from history so we don't keep trying to suspend them
        groupHistory = groupHistory.slice(0, MAX_ACTIVE_GROUPS);

        groupsToSuspend.forEach(groupId => {
            suspendEntireGroup(groupId);
        });
    }
}

async function suspendEntireGroup(groupId) {
    try {
        const tabs = await chrome.tabs.query({ groupId: groupId });
        
        tabs.forEach(tab => {
            // CRITICAL CHECKS: Don't kill important tabs
            const isProtectable = tab.active || tab.audible || tab.pinned;
            
            if (!isProtectable) {
                // This is the "Magic" API that clears RAM but keeps the tab visible
                chrome.tabs.discard(tab.id);
                console.log(`[AI Manager] Suspended tab: ${tab.title} in group ${groupId}`);
            }
        });
    } catch (e) {
        console.error("Group might have been closed:", e);
    }
}

// Clean up history if a group is closed
chrome.tabGroups.onRemoved.addListener((group) => {
    groupHistory = groupHistory.filter(id => id !== group.id);
});