# TABBetter
> **Focus better by turning a chaotic browser into a structured workspace — in one click.**

---

## 🚨 The Problem

Modern browsing encourages multitasking, but dozens of open tabs quickly turn into cognitive overload.  
A cluttered browser:

- Breaks focus and workflow continuity  
- Makes it harder to find relevant information  
- Consumes unnecessary system memory  
- Increases background resource usage without users realizing it  

What starts as “just a few tabs” becomes a productivity and performance problem.

---

## 💡 The Solution

**TABBetter** is a lightweight, AI-powered Chrome extension that transforms tab chaos into clarity.

With **one click**, TABBetter:
- Automatically groups related tabs into meaningful categories using AI  
- Surfaces which tabs are consuming the most RAM  
- Encourages users to close inactive or unnecessary tabs  

All through a calm, minimal interface designed to reduce visual noise.

> **TABBetter doesn’t just organize tabs — it restores focus.**

---

## ✨ Key Features

1. **Smart Tab Grouping (AI-powered)**  
   - Uses **Google’s Gemini API** to analyze open tab titles  
   - Automatically creates logical, human-readable tab groups  
   - Applies valid Chrome tab group colors with safe fallbacks  

2. **Memory Manager**  
   - Estimates RAM usage per tab  
   - Displays tabs **sorted from highest to lowest memory usage**  
   - Helps users quickly identify performance bottlenecks  

3. **Clean, Intuitive UI**  
   - Designed in **Figma** with a focus on calm, clarity, and accessibility  
   - Smooth animations and transitions  
   - Minimal text, clear hierarchy, and soft color palette  

4. **One-Click Actions**  
   - Organize all tabs instantly  
   - Ungroup all tabs  
   - Navigate between main view and Memory Manager seamlessly  

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** – Popup structure and layout  
- **CSS3** – Custom styling, animations, and responsive popup design  
- **Vanilla JavaScript** – Logic, UI updates, and Chrome API interactions  

### Browser APIs
- **Chrome Extensions API**
  - `chrome.tabs`
  - `chrome.tabGroups`
  - `chrome.tabs.query`
  - `chrome.tabs.group`
  - `chrome.tabs.ungroup`

### AI / Backend
- **Google Gemini API** (`gemini-2.5-flash`)
  - Used for intelligent categorization of open tabs  
  - Prompt-engineered to return strict JSON output for reliability  

### Design
- **Figma**
  - UI/UX design  
  - Visual hierarchy and spacing  
  - Color system and component layout  

---

## 🧠 How It Works

### Smart Grouping Flow
1. User clicks **“Organize Tabs”**  
2. Extension collects all open tab titles in the current window  
3. Titles are sent to the **Gemini API**  
4. Gemini returns structured JSON containing:
   - Group name  
   - Tab IDs  
   - Suggested color  
5. Chrome Tab Groups are created programmatically  
6. UI updates to confirm completion  

### Memory Manager Flow
1. Tabs are scanned locally  
2. RAM usage is **estimated heuristically** based on tab type and URL  
3. Tabs are sorted by estimated memory consumption  
4. Results are displayed in descending order  

---

## 🌱 Environmental Impact

Inactive tabs don’t just slow down your device — they consume energy.

- Background browser activity can account for **10–20% of memory usage** during heavy tab sessions  
- Fewer active tabs = less CPU & RAM usage  
- Reduced resource usage contributes to lower data center energy demand  

TABBetter promotes **conscious browsing**, benefiting both users and the environment.

---

## 🎯 Why TABBetter?

- No accounts  
- No tracking  
- No clutter  
- No learning curve  

Just a **smarter browser experience**, powered by AI.

---

## 🚀 Future Improvements

- Real memory usage via Chrome performance APIs  
- Auto-suggest closing tabs after inactivity  
- Persistent grouping profiles (Work / School / Personal)  
- Cross-window grouping  
- Dark mode  

---

## 👥 Built For

- Students  
- Developers  
- Researchers  
- Heavy browser users  
- Anyone overwhelmed by too many tabs  

---

## 🏁 Hackathon Project

**TABBetter** was built for **McHacks 2026** as a proof-of-concept demonstrating how AI can improve everyday productivity tools with minimal friction.
