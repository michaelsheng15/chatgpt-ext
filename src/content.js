// content.js - Injects the React app into ChatGPT and handles communication with background script

// Inject React app
function injectReactApp() {
    const appContainer = document.createElement("div");
    appContainer.id = "react-app-container";
    document.body.appendChild(appContainer);

    // Load React app from extension
    fetch(chrome.runtime.getURL("asset-manifest.json"))
        .then((response) => response.json())
        .then((manifest) => {
            const script = document.createElement("script");
            script.src = chrome.runtime.getURL(manifest["files"]["main.js"]);
            script.type = "module";
            document.body.appendChild(script);
        })
        .catch((error) => console.error("Failed to inject React app:", error));
}

// Get settings and send to React app
function sendSettingsToReact() {
    chrome.storage.sync.get("alwaysShowInsights", (data) => {
        window.postMessage({
            type: "SETTINGS_UPDATE",
            alwaysShowInsights: data.alwaysShowInsights ?? true
        }, "*");
    });
}

// Listen for setting changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.alwaysShowInsights) {
        window.postMessage({
            type: "SETTINGS_UPDATE",
            alwaysShowInsights: changes.alwaysShowInsights.newValue
        }, "*");
    }
});

// Reset first run flag
chrome.storage.sync.set({ firstRun: true }, () => {
    console.log("Page loaded: firstRun reset to true.");
});

// Inject scripts into page
const injectScript = (file) => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL(file));
    document.head.appendChild(script);
};

// Inject API script
injectScript('api.js');

// Current active session ID
let currentSessionId = `session-${Date.now()}`;

// Create a bridge between page scripts and background script
window.addEventListener('message', async (event) => {
    // Skip messages from other sources
    if (event.source !== window) return;

    const message = event.data;

    // Handle different message types from page scripts
    switch (message.type) {
        case 'ENHANCE_PROMPT':
            try {
                // 1) Update or store the session ID if provided
                if (message.sessionId) {
                    currentSessionId = message.sessionId;
                }

                // 2) Connect the WebSocket *before* calling the API
                console.log("Connecting socket for session:", currentSessionId);
                await chrome.runtime.sendMessage({
                    type: "CONNECT_SOCKET",
                    sessionId: currentSessionId
                });

                // 3) Now call the enhancer API
                console.log("Calling enhancer API for session:", currentSessionId);
                const response = await chrome.runtime.sendMessage({
                    type: "API_CALL",
                    endpoint: "enhancer",
                    method: "POST",
                    data: {
                        prompt: message.prompt,
                        sessionId: currentSessionId
                    }
                });

                // 4) Send response back to page
                if (response.success) {
                    window.postMessage({
                        type: 'ENHANCE_PROMPT_RESPONSE',
                        data: response.data
                    }, '*');
                } else {
                    window.postMessage({
                        type: 'ENHANCE_PROMPT_ERROR',
                        error: response.error
                    }, '*');
                }
            } catch (error) {
                console.error('Error calling enhancer API:', error);
                window.postMessage({
                    type: 'ENHANCE_PROMPT_ERROR',
                    error: error.message
                }, '*');
            }
            break;

        case 'GET_NODE_DATA':
            try {
                const response = await chrome.runtime.sendMessage({
                    type: "GET_NODE_DATA",
                    sessionId: currentSessionId,
                    nodeName: message.nodeName
                });

                window.postMessage({
                    type: 'NODE_DATA_RESPONSE',
                    nodeName: message.nodeName,
                    data: response.data
                }, '*');
            } catch (error) {
                console.error('Error getting node data:', error);
                window.postMessage({
                    type: 'NODE_DATA_ERROR',
                    nodeName: message.nodeName,
                    error: error.message
                }, '*');
            }
            break;

        case 'CHECK_SOCKET_STATUS':
            try {
                const status = await chrome.runtime.sendMessage({
                    type: "CHECK_SOCKET_STATUS",
                    sessionId: currentSessionId
                });

                window.postMessage({
                    type: 'SOCKET_STATUS_RESPONSE',
                    connected: status.connected,
                    lastActivity: status.lastActivity
                }, '*');
            } catch (error) {
                console.error('Error checking socket status:', error);
                window.postMessage({
                    type: 'SOCKET_STATUS_ERROR',
                    error: error.message
                }, '*');
            }
            break;
    }
});

// Forward messages from background script to page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Only handle messages from our background script
    if (sender.id !== chrome.runtime.id) return;

    // Process the message for NODE_COMPLETED to ensure proper formatting
    if (message.type === "NODE_COMPLETED") {
        // Extract node_name from 'node_name' field in message or from 'node_data' if available
        const node_name = message.node_name;
        const node_output = message.node_output;
        const node_type = message.node_type || node_name;

        // Then forward it
        const modifiedMessage = {
            ...message,
            node_name,
            node_type,
            node_output,
            timestamp: message.timestamp || Date.now()
        };

        // Forward the modified message to page scripts
        window.postMessage(modifiedMessage, '*');
    } else {
        // Forward other messages unchanged to page scripts
        window.postMessage(message, '*');
    }

    // Acknowledge receipt
    sendResponse({ received: true });
    return true;
});

// Initialize
injectReactApp();
sendSettingsToReact();

function onSendClick() {
    window.postMessage({ type: "SEND_BUTTON_CLICKED" }, "*");
  }
  

  document.addEventListener(
    "pointerdown",
    (event) => {
      const sendButton = event.target.closest(
        'button[data-testid="send-button"][aria-label="Send prompt"]'
      );
      if (sendButton) {
        console.log("Pointerdown event captured on send button.");
        onSendClick();
      }
    },
    true
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        const promptInput = event.target.closest('#prompt-textarea');
        if (promptInput) {
          console.log("Enter key pressed in prompt input (contenteditable div).");
          onSendClick();
        }
      }
    },
    true
  );