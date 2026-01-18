# ThreadSnap

<p align="center">
  <img src="https://github.com/Sudharsan-T/ThreadSnap/blob/master/THREADSNAP-Arch.png" alt="ThreadSnap Architecture" width="800">
</p>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sudharsan12/)
[![X (Twitter)](https://img.shields.io/badge/X-%231DA1F2.svg?style=for-the-badge&logo=X&logoColor=white)](https://x.com/Dharsant7)

> High-level architecture of ThreadSnap running entirely in the browser.

ThreadSnap is a local Chrome extension for extracting and carrying AI chat context between sessions.

It is designed for users who work in long AI conversations and want a clean, reliable way to continue those conversations in a fresh chat window without relying on server-side storage or heavy APIs.

ThreadSnap runs entirely on the user’s machine.



---

## What ThreadSnap Does

* Reads the full conversation from the current AI chat page
* Structures the conversation into a clean, copy‑paste friendly context block
* Preserves roles, flow, and intent of the discussion
* Allows the context to be pasted into a new chat to continue work seamlessly

ThreadSnap focuses on **context transfer**, not chat history storage or cloud syncing.

---

## What ThreadSnap Does NOT Do

* It does not store your chats on any server
* It does not require account creation
* It does not auto‑sync conversations across devices
* It does not promise unlimited summarization using free APIs
* It does not modify or interfere with the AI chat platform itself

---

## How It Works (High Level)

1. You open an AI chat (ChatGPT, compatible chat interfaces)
2. You click the ThreadSnap extension
3. ThreadSnap reads the visible chat content from the page
4. The content is structured into a reusable context block
5. You copy the output and paste it into a new chat

All processing happens locally inside your browser.

---

## Why ThreadSnap Exists

Long AI chats become slow, unstable, or unusable over time.

ThreadSnap solves this by letting you:

* reset the chat window
* keep the full working context
* continue without starting from scratch

It is meant to be a practical tool, not a replacement for AI platforms.

---

## Installation

ThreadSnap is not published on the Chrome Web Store.

### Load Locally

1. Download the latest version from the Releases
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode**
<img src="https://github.com/user-attachments/assets/400b1b61-7b62-4728-a59b-259d5e7eec31"  alt="ThreadSnap Architecture" width="550">

4. Click **Load unpacked**
<img src="https://github.com/user-attachments/assets/b4a52b48-a783-4b05-9e12-01dc4ef0bc5f"  alt="ThreadSnap Architecture" width="550">

5. Select the ThreadSnap project folder

The extension will now appear in your browser.

---

## Usage

1. Open an AI chat page
2. Click the ThreadSnap extension icon
3. Click **Summarize / Export**
4. Copy the generated context block
5. Paste it into a new chat and continue

No additional configuration is required for basic usage.

---

## Optional API Usage

ThreadSnap can optionally use external LLM APIs (such as GROQ) for advanced context distillation.

* API keys are provided by the user
* Keys are stored locally (only if explicitly saved)
* API usage is subject to provider limits

For stability, ThreadSnap is designed to work even without API-based summarization.

---

## Security & Privacy

* No data leaves your browser unless you explicitly enable an API
* No tracking, analytics, or telemetry
* No background services
* No remote storage

ThreadSnap is intentionally minimal.

---

## Known Limitations

* Free LLM APIs may impose rate or token limits
* Very long chats may require multiple passes when using APIs
* Output quality depends on the structure of the original conversation

These are design tradeoffs, not bugs.

---

## Project Philosophy

ThreadSnap is built with the following principles:

* Local first
* User controlled
* Simple over clever
* Reliable over flashy

The goal is to solve one problem well: **moving context between chats**.

---

## Roadmap (Non‑binding)

* Optional continuation vs summary modes
* Improved formatting presets
* Optional local‑only processing mode

No timelines are promised.

---

## License

MIT License.

Use it, modify it, and ship your own version if it helps your workflow.
