(function () {
  console.log("ThreadSnap content script injected (dynamic)");

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
})();
