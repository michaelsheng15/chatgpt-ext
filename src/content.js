// content.js - Injects the React app into ChatGPT and handles communication with background script

// Inject React app using a Shadow DOM to isolate it
function injectReactApp() {
    const appContainer = document.createElement("div");
    appContainer.id = "react-app-container";

    // Shadow root for your main React app
    const shadowRoot = appContainer.attachShadow({ mode: "open" });

    // Where React will mount inside the shadow root
    const innerContainer = document.createElement("div");
    innerContainer.id = "react-app-inner-container";
    shadowRoot.appendChild(innerContainer);

    document.body.appendChild(appContainer);

    // Load React from extension
    fetch(chrome.runtime.getURL("asset-manifest.json"))
        .then((r) => r.json())
        .then((manifest) => {
            const script = document.createElement("script");
            script.src = chrome.runtime.getURL(manifest["files"]["main.js"]);
            script.type = "module";
            document.body.appendChild(script);
        })
        .catch((error) => console.error("Failed to inject React app:", error));
}

function ensureOptimizeContainer() {
    // Find the parent container that has the audio icon
    // Looking at the bottom container with buttons
    const bottomContainer = document.querySelector("div.mb-2.mt-1.flex.items-center.justify-between.sm\\:mt-5");
    if (!bottomContainer) {
        console.log("Bottom container not found");
        return;
    }

    // Find the right side of the container where the audio icon is
    const rightSideContainer = bottomContainer.lastElementChild;
    if (!rightSideContainer || !rightSideContainer.classList.contains("flex")) {
        console.log("Right side container not found");
        return;
    }

    // Create or reuse the optimize div
    let optimizeDiv = document.getElementById("my-optimize-floating-block");
    if (!optimizeDiv) {
        optimizeDiv = document.createElement("div");
        optimizeDiv.id = "my-optimize-floating-block";
        optimizeDiv.style.marginRight = "4px"; // Space between our element and other elements
        optimizeDiv.style.display = "flex";    // Make it a flex container
        optimizeDiv.style.alignItems = "center"; // Center content vertically
        optimizeDiv.style.zIndex = "1000";     // Ensure it stays on top
    }

    // Check if our element is already the first child of the right container
    if (optimizeDiv.parentNode === rightSideContainer &&
        rightSideContainer.firstElementChild === optimizeDiv) {
        return; // Already correctly inserted
    }

    // Insert our element as the first child of the right container
    // This puts it directly to the left of the audio icon
    rightSideContainer.insertBefore(optimizeDiv, rightSideContainer.firstElementChild);
}

// Create a more robust observer that ensures your element stays visible
function setupRobustObserver() {
    // Main observer to detect when the chat interface changes
    const mainObserver = new MutationObserver(() => {
        ensureOptimizeContainer();
    });

    // More aggressive settings for the observer
    mainObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'] // Watch for style/class changes
    });

    // Secondary observer specifically for input events
    document.addEventListener('input', () => {
        // Delay slightly to let ChatGPT's own UI update
        setTimeout(ensureOptimizeContainer, 50);
    });

    // Also watch for focus/blur events which might affect the UI
    document.addEventListener('focus', ensureOptimizeContainer, true);
    document.addEventListener('blur', ensureOptimizeContainer, true);

    // Check periodically as a fallback
    setInterval(ensureOptimizeContainer, 1000);

    // Run it once initially
    ensureOptimizeContainer();
}

// Replace your current observer setup with this more robust version
setupRobustObserver();

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

function handleKeyboardShortcuts(event) {
    // Check for Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        console.log("Command+Enter or Ctrl+Enter detected");
        // Dispatch the same message that clicking the island button would
        window.postMessage({ type: "OPTIMIZE_BUTTON_CLICKED" }, "*");
        // Prevent default behavior
        event.preventDefault();
    }
}

// Add the keyboard shortcut listener
document.addEventListener('keydown', handleKeyboardShortcuts, true);

// Update the existing keyboard listener to avoid conflicts
document.addEventListener(
    "keydown",
    (event) => {
        // Only trigger this for regular Enter without Command key
        if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            const promptInput = event.target.closest('#prompt-textarea');
            if (promptInput) {
                console.log("Enter key pressed in prompt input (contenteditable div).");
                onSendClick();
            }
        }
    },
    true
);

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

window.addEventListener("load", () => {
    setTimeout(() => {
        injectReactApp();
        sendSettingsToReact();
    }, 2000);
});


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