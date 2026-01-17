// embed.js
// This is a placeholder for generating embeddings for tab text
// In real use, replace with a proper pretrained model (e.g., SentenceTransformers via @xenova/transformers)

export async function embedText(text) {
    // For now, we create a simple mock numeric vector
    // Real embedding: a numeric array representing text meaning
    const hash = text
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Return as an array of numbers (fake embedding)
    return Array.from({ length: 8 }, (_, i) => ((hash + i) % 100) / 100);
  }
  