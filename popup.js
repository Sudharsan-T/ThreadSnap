const setupDiv = document.getElementById("setup");
const mainDiv = document.getElementById("main");

const apiKeyInput = document.getElementById("apiKey");
const rememberCheckbox = document.getElementById("rememberKey");

const saveKeyBtn = document.getElementById("saveKey");
const summarizeBtn = document.getElementById("summarize");
const outputBox = document.getElementById("output");
const copyBtn = document.getElementById("copy");

/*  INITIAL LOAD */

chrome.storage.local.get(["apiKey"], (result) => {
  if (result.apiKey) {
    setupDiv.style.display = "none";
    mainDiv.style.display = "block";
  }
});

/*  SAVE API KEY */

saveKeyBtn.onclick = () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    alert("API key required");
    return;
  }

  if (rememberCheckbox.checked) {
    chrome.storage.local.set({ apiKey: key });
  }

  setupDiv.style.display = "none";
  mainDiv.style.display = "block";
};

/* SUMMARIZE CHAT */

summarizeBtn.onclick = async () => {
  outputBox.value = "Summarizing chat...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) {
      outputBox.value = "";
      alert("No active tab found.");
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_CHAT" },
      async (response) => {
        if (chrome.runtime.lastError) {
          outputBox.value = "";
          alert("Content script not available on this page.");
          return;
        }

        if (!response || !response.messages || response.messages.length === 0) {
          outputBox.value = "";
          alert("No chat messages found.");
          return;
        }

        const apiKey =
          apiKeyInput.value.trim() || (await getStoredKey());

        if (!apiKey) {
          outputBox.value = "";
          alert("API key not found. Please enter your API key.");
          return;
        }

        try {
          const summary = await callGrok(apiKey, response.messages);
          outputBox.value = summary;
        } catch (err) {
          console.error(err);
          outputBox.value = "";
          alert("Failed to summarize chat. Check API key or network.");
        }
      }
    );
  });
};

/* COPY */

copyBtn.onclick = () => {
  if (!outputBox.value) return;
  navigator.clipboard.writeText(outputBox.value);
};

/* HELPERS */

function getStoredKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (res) => {
      resolve(res.apiKey);
    });
  });
}

/* GROQ CALL */

async function callGrok(apiKey, messages) {
  const prompt = `
You are a chat context distillation engine.

Compress the chat into a reusable CONTEXT BLOCK.

Rules:
- Be concise and structured
- Remove casual conversation
- Preserve goals, constraints, decisions
- Output plain text only

Format:
SYSTEM CONTEXT:
USER PROFILE:
CURRENT GOALS:
KEY DECISIONS:
CONSTRAINTS:
ASSUMPTIONS:
OPEN THREADS:
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
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
    }
  );

  const data = await response.json();

  if (!data.choices || !data.choices.length) {
    throw new Error("Invalid LLM response");
  }

  return data.choices[0].message.content;
}
