// content.js - Injects the React app into ChatGPT and syncs settings from the popup using postMessage.

function injectReactApp() {
    const appContainer = document.createElement("div");
    appContainer.id = "react-app-container";
    document.body.appendChild(appContainer);

    // First ensure Socket.io is loaded
    const socketScript = document.createElement('script');
    socketScript.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
    socketScript.crossOrigin = 'anonymous';

    // Wait for Socket.io to load before loading the app
    socketScript.onload = () => {
        console.log("Socket.io loaded successfully");

        // Then load React app
        fetch(chrome.runtime.getURL("asset-manifest.json"))
            .then((response) => response.json())
            .then((manifest) => {
                const script = document.createElement("script");
                script.src = chrome.runtime.getURL(manifest["files"]["main.js"]);
                script.type = "module";
                document.body.appendChild(script);
            })
            .catch((error) => console.error("Failed to inject React app:", error));
    };

    socketScript.onerror = () => {
        console.error("Failed to load Socket.io");
        // Still try to load the app even if Socket.io fails
        fetch(chrome.runtime.getURL("asset-manifest.json"))
            .then((response) => response.json())
            .then((manifest) => {
                const script = document.createElement("script");
                script.src = chrome.runtime.getURL(manifest["files"]["main.js"]);
                script.type = "module";
                document.body.appendChild(script);
            })
            .catch((error) => console.error("Failed to inject React app:", error));
    };

    document.head.appendChild(socketScript);
}

function sendSettingsToReact() {
    chrome.storage.sync.get("alwaysShowInsights", (data) => {
        window.postMessage({ type: "SETTINGS_UPDATE", alwaysShowInsights: data.alwaysShowInsights ?? true }, "*");
    });
}

chrome.storage.onChanged.addListener((changes) => {
    if (changes.alwaysShowInsights) {
        window.postMessage({ type: "SETTINGS_UPDATE", alwaysShowInsights: changes.alwaysShowInsights.newValue }, "*");
    }
});

chrome.storage.sync.set({ firstRun: true }, () => {
    console.log("Page loaded: firstRun reset to true.");
});

const injectScript = (file) => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL(file));
    document.head.appendChild(script);
};

// Inject the API functionality
injectScript('api.js');

// Listen for messages from the injected script
window.addEventListener('message', async (event) => {
    if (event.data.type === 'ENHANCE_PROMPT') {
        try {
            const response = await fetch('http://localhost:5000/enhancer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: event.data.prompt,
                    sessionId: event.data.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            window.postMessage({ type: 'ENHANCE_PROMPT_RESPONSE', data }, '*');
        } catch (error) {
            console.error('Error:', error);
            window.postMessage({ type: 'ENHANCE_PROMPT_ERROR', error: error.message }, '*');
        }
    }
});

injectReactApp();
sendSettingsToReact();