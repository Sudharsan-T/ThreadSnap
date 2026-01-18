const setupDiv = document.getElementById("setup");
const mainDiv = document.getElementById("main");

const apiKeyInput = document.getElementById("apiKey");
const rememberCheckbox = document.getElementById("rememberKey");

const saveKeyBtn = document.getElementById("saveKey");
const summarizeBtn = document.getElementById("summarize");
const outputBox = document.getElementById("output");
const copyBtn = document.getElementById("copy");

/* ---------- INITIAL LOAD ---------- */

chrome.storage.local.get(["apiKey"], (result) => {
  if (result.apiKey) {
    setupDiv.style.display = "none";
    mainDiv.style.display = "block";
  }
});

/* ---------- SAVE API KEY ---------- */

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

/* ---------- SUMMARIZE CHAT ---------- */

summarizeBtn.onclick = async () => {
  outputBox.value = "Summarizing chat...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) {
      outputBox.value = "";
      alert("No active tab found");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const nodes = document.querySelectorAll('[data-message-author-role]');
          const messages = [];

          nodes.forEach((node) => {
            const role = node.getAttribute("data-message-author-role");
            const content = node.innerText?.trim();
            if (role && content) {
              messages.push({ role, content });
            }
          });

          return messages;
        }
      },
      async (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          outputBox.value = "";
          alert("Failed to read chat");
          return;
        }

        const messages = results[0].result;
        if (!messages.length) {
          outputBox.value = "";
          alert("No messages found");
          return;
        }

        const apiKey =
          apiKeyInput.value.trim() || (await getStoredKey());

        if (!apiKey) {
          outputBox.value = "";
          alert("API key missing");
          return;
        }

        try {
          const chunks = chunkMessages(messages, 2000);
          const miniSummaries = [];

          for (let i = 0; i < chunks.length; i++) {
            const mini = await callGrok(apiKey, [
              {
                role: "system",
                content:
                  "Summarize this conversation chunk. Preserve facts, decisions, and assumptions. Be concise."
              },
              ...chunks[i]
            ]);

            miniSummaries.push(mini);

            // small delay to avoid rate limits
            await sleep(1500);
          }

          const finalSummary = await callGrok(apiKey, [
            {
              role: "system",
              content: `
You are creating a CONTEXT HANDOFF block for chat continuation.

Rules:
- Do not summarize again
- Do not explain
- Do not add ideas
- Output plain text only

Structure:
SYSTEM CONTEXT:
TOPIC CONTEXT:
ANALYSIS STATE:
KEY FACTS & ASSUMPTIONS:
OPEN DIRECTIONS:
INSTRUCTIONS FOR CONTINUATION:
`
            },
            {
              role: "user",
              content: miniSummaries.join("\n\n")
            }
          ]);

          outputBox.value = finalSummary;
        } catch (err) {
          console.error(err);
          outputBox.value = "";
          alert(err.message || "Summarization failed");
        }
      }
    );
  });
};

/* ---------- COPY ---------- */

copyBtn.onclick = () => {
  if (outputBox.value) {
    navigator.clipboard.writeText(outputBox.value);
  }
};

/* ---------- HELPERS ---------- */

function getStoredKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (res) => {
      resolve(res.apiKey);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------- GROQ CALL ---------- */

async function callGrok(apiKey, messages) {
  const finalMessages = [
    ...messages,
    { role: "user", content: "Perform the task as instructed above." }
  ];

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        max_tokens: 200,
        messages: finalMessages
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (
    !data.choices ||
    !data.choices.length ||
    !data.choices[0].message ||
    !data.choices[0].message.content ||
    !data.choices[0].message.content.trim()
  ) {
    throw new Error("Empty model response");
  }

  return data.choices[0].message.content.trim();
}

/* ---------- CHUNKING ---------- */

function chunkMessages(messages, maxChars = 3000) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const msg of messages) {
    const size = msg.content.length;

    if (currentSize + size > maxChars) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(msg);
    currentSize += size;
  }

  if (currentChunk.length) {
    chunks.push(currentChunk);
  }

  return chunks;
}
