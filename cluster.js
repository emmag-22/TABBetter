// cluster.js
// Simple offline clustering based on embedding similarity

export function clusterTabs(tabs) {
    const clusters = [];
  
    // Naive approach: each tab starts in its own cluster
    tabs.forEach(tab => {
      // Compare tab to existing clusters
      let added = false;
      for (const cluster of clusters) {
        const sim = cosineSimilarity(tab.embedding, cluster.centroid);
        if (sim > 0.85) { // threshold for “similar enough”
          cluster.tabs.push(tab);
          // Update centroid
          cluster.centroid = averageEmbeddings(cluster.tabs.map(t => t.embedding));
          added = true;
          break;
        }
      }
      if (!added) {
        clusters.push({ tabs: [tab], centroid: tab.embedding.slice() });
      }
    });
  
    return clusters;
  }
  
  // ---------------------------
  // Helper functions
  // ---------------------------
  
  function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB + 1e-10);
  }
  
  function averageEmbeddings(embeddings) {
    const len = embeddings[0].length;
    const avg = Array(len).fill(0);
    embeddings.forEach(vec => vec.forEach((v, i) => avg[i] += v / embeddings.length));
    return avg;
  }
  