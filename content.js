chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CHAT") {
    const messages = [];

    const userMessages = document.querySelectorAll('[data-message-author-role="user"]');
    const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');

    userMessages.forEach((node) => {
      messages.push({ role: "user", content: node.innerText });
    });

    assistantMessages.forEach((node) => {
      messages.push({ role: "assistant", content: node.innerText });
    });

    sendResponse({ messages });
  }
});
