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
                // Forward to background script
                const response = await chrome.runtime.sendMessage({
                    type: "API_CALL",
                    endpoint: "enhancer",
                    method: "POST",
                    data: {
                        prompt: message.prompt,
                        sessionId: message.sessionId || currentSessionId
                    }
                });

                // Store the session ID for future use
                if (message.sessionId) {
                    currentSessionId = message.sessionId;
                }

                // Connect WebSocket for this session
                chrome.runtime.sendMessage({
                    type: "CONNECT_SOCKET",
                    sessionId: currentSessionId
                });

                // Send response back to page
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

    // Forward to page scripts
    window.postMessage(message, '*');

    // Acknowledge receipt
    sendResponse({ received: true });
    return true;
});

// Initialize
injectReactApp();
sendSettingsToReact();

// Debug info in console
console.log('ChatGPT Enhancer content script loaded, session ID:', currentSessionId);