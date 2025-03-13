// api.js - CSP-friendly API functions that communicate through content script messaging

// Current session ID
const SESSION_ID = `session-${Date.now()}`;

// Main API function that works around CSP restrictions
window.callEnhancerAPI = async (prompt, sessionId = SESSION_ID) => {
    console.log("callEnhancerAPI invoked with prompt:", prompt.substring(0, 50) + "...");

    return new Promise((resolve, reject) => {
        // Send message to content script, which forwards to background script
        window.postMessage({
            type: 'ENHANCE_PROMPT',
            prompt,
            sessionId
        }, '*');

        // Set up listener for response
        const messageHandler = (event) => {
            // Skip messages from other sources
            if (event.source !== window) return;

            const message = event.data;

            if (message.type === 'ENHANCE_PROMPT_RESPONSE') {
                window.removeEventListener('message', messageHandler);
                console.log("Received enhancement response:", message.data);
                resolve(message.data);
            } else if (message.type === 'ENHANCE_PROMPT_ERROR') {
                window.removeEventListener('message', messageHandler);
                console.error("Enhancement error:", message.error);
                reject(new Error(message.error));
            }
        };

        window.addEventListener('message', messageHandler);

        // Set a timeout for safety
        setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('API request timed out after 30 seconds'));
        }, 30000);
    });
};

// Extended API functions with CSP-friendly design
window.enhancerAPI = {
    // Main enhance function (same as window.callEnhancerAPI)
    enhancePrompt: window.callEnhancerAPI,

    // Get current session ID
    getSessionId: () => SESSION_ID,

    // Check WebSocket connection status
    checkConnectionStatus: () => {
        return new Promise((resolve, reject) => {
            window.postMessage({ type: 'CHECK_SOCKET_STATUS' }, '*');

            const messageHandler = (event) => {
                if (event.source !== window) return;

                const message = event.data;

                if (message.type === 'SOCKET_STATUS_RESPONSE') {
                    window.removeEventListener('message', messageHandler);
                    resolve({
                        connected: message.connected,
                        lastActivity: message.lastActivity
                    });
                } else if (message.type === 'SOCKET_STATUS_ERROR') {
                    window.removeEventListener('message', messageHandler);
                    reject(new Error(message.error));
                }
            };

            window.addEventListener('message', messageHandler);

            // Set a timeout
            setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                reject(new Error('Status check timed out'));
            }, 5000);
        });
    },

    // Get data for a specific node
    getNodeData: (nodeName) => {
        return new Promise((resolve, reject) => {
            window.postMessage({
                type: 'GET_NODE_DATA',
                nodeName
            }, '*');

            const messageHandler = (event) => {
                if (event.source !== window) return;

                const message = event.data;

                if (message.type === 'NODE_DATA_RESPONSE' && message.nodeName === nodeName) {
                    window.removeEventListener('message', messageHandler);
                    resolve(message.data);
                } else if (message.type === 'NODE_DATA_ERROR' && message.nodeName === nodeName) {
                    window.removeEventListener('message', messageHandler);
                    reject(new Error(message.error));
                }
            };

            window.addEventListener('message', messageHandler);

            // Set a timeout
            setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                reject(new Error(`Getting data for node ${nodeName} timed out`));
            }, 5000);
        });
    },

    // Listen for node updates
    onNodeUpdate: (callback) => {
        const nodeUpdateHandler = (event) => {
            if (event.source !== window) return;

            const message = event.data;

            if (message.type === 'NODE_COMPLETED') {
                callback(message.nodeName, message.nodeData);
            }
        };

        window.addEventListener('message', nodeUpdateHandler);

        // Return function to remove listener
        return () => window.removeEventListener('message', nodeUpdateHandler);
    },

    // Generate fallback enhancement
    generateFallbackEnhancement: (prompt) => {
        console.log("Using fallback enhancement");

        // Simple formatting enhancement
        return {
            enhancedPrompt: `# Task\n${prompt}\n\n# Desired Output\n- Well-structured response\n- Clear explanations\n- Accurate information\n\n# Additional Context\nPlease be thorough and detailed in your response.`,
            _fallback: true
        };
    },

    // Debug function
    debug: () => {
        return {
            sessionId: SESSION_ID,
            apiAvailable: typeof window.callEnhancerAPI === 'function',
            inContentScript: typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id ? true : false
        };
    }
};

// Set up listeners for WebSocket events forwarded from content script
window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    const message = event.data;

    // Log important events
    switch (message.type) {
        case 'SOCKET_CONNECTED':
            console.log("WebSocket connected via background script");
            break;

        case 'SOCKET_DISCONNECTED':
            console.log("WebSocket disconnected");
            break;

        case 'NODE_COMPLETED':
            console.log(`Node completed: ${message.nodeName}`);
            break;
    }
});

// Log that the API is ready
console.log('ChatGPT Enhancer API initialized, session:', SESSION_ID);