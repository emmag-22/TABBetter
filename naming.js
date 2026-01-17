// naming.js

// Assign a group name based on the first tab title (simple mock)
export function nameCluster(cluster) {
    if (!cluster.tabs || cluster.tabs.length === 0) return "Group";
    // Pick first 3 words of first tab as group name
    return cluster.tabs[0].title.split(" ").slice(0, 3).join(" ") || "Group";
  }
  
  // Assign a color from the 8 Chrome tabGroup colors systematically
  const colors = ["blue", "red", "yellow", "green", "pink", "purple", "cyan", "grey"];
  let colorIndex = 0;
  
  export function colorForName(name) {
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    return color;
  }
  