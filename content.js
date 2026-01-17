function extractPageInfo() {
    const title = document.title || "";
  
    const description =
      document.querySelector('meta[name="description"]')?.content ||
      document.querySelector('meta[property="og:description"]')?.content ||
      "";
  
    const headings = Array.from(document.querySelectorAll("h1, h2"))
      .map(h => h.innerText)
      .slice(0, 5)
      .join(" ");
  
    const textSnippet = document.body?.innerText
      ?.replace(/\s+/g, " ")
      .slice(0, 1000) || "";
  
    return {
      title,
      description,
      headings,
      textSnippet,
      url: window.location.href
    };
  }
  
  // Send extracted data back to background
  chrome.runtime.sendMessage({
    type: "PAGE_INFO",
    payload: extractPageInfo()
  });
