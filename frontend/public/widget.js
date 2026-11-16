
(function () {
  const script = document.currentScript;

  if (!script) return;

  // Prevent duplicate widget initialization
  if (script.dataset.bulkchatInitialized === "true") return;
  script.dataset.bulkchatInitialized = "true";

  // Read Public Key
  const publicKey = script.getAttribute("data-key");

  if (!publicKey) {
    console.error("BulkChat: Public key is missing.");
    return;
  }

  // Automatically detect BulkChat server origin
  const widgetOrigin = new URL(script.src).origin;
  const CHAT_URL = `${widgetOrigin}/embed/chat`;

  // Create chat button
  const button = document.createElement("button");

  button.innerHTML = "💬";
  button.title = "Chat with us";
  button.setAttribute("aria-label", "Open BulkChat support");

  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "28px",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  });

  // Create chat iframe
  const iframe = document.createElement("iframe");

  iframe.src = `${CHAT_URL}?key=${encodeURIComponent(publicKey)}`;
  iframe.title = "BulkChat Support";

  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "100px",
    right: "24px",
    width: "380px",
    height: "550px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 120px)",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 5px 30px rgba(0,0,0,0.2)",
    zIndex: "999998",
    display: "none",
    background: "#fff",
  });

  // Secure communication with the iframe
  window.addEventListener("message", function (event) {
    if (event.origin !== widgetOrigin) return;
    if (event.source !== iframe.contentWindow) return;

    if (event.data?.type === "BULKCHAT_READY") {
      iframe.contentWindow.postMessage(
        {
          type: "BULKCHAT_PARENT_INFO",
          customerWebsite: window.location.href,
        },
        widgetOrigin
      );
    }
  });

  // Open / close chat
  button.addEventListener("click", function () {
    const isOpen = iframe.style.display === "block";

    iframe.style.display = isOpen ? "none" : "block";
    button.innerHTML = isOpen ? "💬" : "✕";
    button.title = isOpen ? "Chat with us" : "Close chat";
  });

  // Add elements after body is available
  function initializeWidget() {
    document.body.appendChild(button);
    document.body.appendChild(iframe);
  }

  if (document.body) {
    initializeWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initializeWidget, {
      once: true,
    });
  }
})();
