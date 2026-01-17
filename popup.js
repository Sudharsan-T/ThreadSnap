const setupDiv = document.getElementById("setup");
const mainDiv = document.getElementById("main");

const apiKeyInput = document.getElementById("apiKey");
const rememberCheckbox = document.getElementById("rememberKey");

const saveKeyBtn = document.getElementById("saveKey");
const summarizeBtn = document.getElementById("summarize");
const outputBox = document.getElementById("output");
const copyBtn = document.getElementById("copy");

// Load stored key
chrome.storage.local.get(["apiKey"], (result) => {
  if (result.apiKey) {
    setupDiv.style.display = "none";
    mainDiv.style.display = "block";
  }
});

saveKeyBtn.onclick = () => {
  const key = apiKeyInput.value.trim();
  if (!key) return alert("API key required");

  if (rememberCheckbox.checked) {
    chrome.storage.local.set({ apiKey: key });
  }

  setupDiv.style.display = "none";
  mainDiv.style.display = "block";
};

summarizeBtn.onclick = async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_CHAT" },
      async (response) => {
        if (!response || !response.messages) {
          alert("Failed to read chat");
          return;
        }

        const apiKey = apiKeyInput.value || (await getStoredKey());
        const summary = await callGrok(apiKey, response.messages);
        outputBox.value = summary;
      }
    );
  });
};

copyBtn.onclick = () => {
  navigator.clipboard.writeText(outputBox.value);
};

function getStoredKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (res) => {
      resolve(res.apiKey);
    });
  });
}

async function callGrok(apiKey, messages) {
  const prompt = `
You are a chat context distillation engine.
Compress the chat into a reusable CONTEXT BLOCK.

Format:
SYSTEM CONTEXT:
USER PROFILE:
CURRENT GOALS:
KEY DECISIONS:
CONSTRAINTS:
ASSUMPTIONS:
OPEN THREADS:
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      temperature: 0,
      messages: [
        { role: "system", content: prompt },
        ...messages
      ]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
