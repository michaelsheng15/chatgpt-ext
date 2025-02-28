/* global io */
// utils.js - Contains helper functions with WebSocket fallback

export const scrape = () => {
  const inputBox = document.querySelector(".ProseMirror");
  if (!inputBox) {
    console.error("ChatGPT input box not found.");
    return "";
  }
  return inputBox.innerText.trim();
};

export const injectPrompt = (enhancedPrompt) => {
  const inputBox = document.querySelector(".ProseMirror");
  if (inputBox) {
    inputBox.innerHTML = enhancedPrompt;
    inputBox.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Enhanced prompt injected:", enhancedPrompt);
  } else {
    console.error("ChatGPT input box not found. Cannot inject enhanced prompt.");
  }
};

// Flags for connection management
let useWebSocketData = false;
let webSocketNodeData = {};
let useDirectFetch = false;

// Function to set WebSocket data availability
export const setUseWebSocketData = (value) => {
  useWebSocketData = value;
};

// Function to enable direct fetch fallback
export const setUseDirectFetch = (value) => {
  useDirectFetch = value;
};

// Function to update node data from WebSocket
export const updateNodeDataFromWebSocket = (nodeName, data) => {
  webSocketNodeData[nodeName] = data;
};

// Fetch node data with fallback mechanisms
export const fetchNodeData = async (nodeName) => {
  console.log(`[fetchNodeData] Fetching data for ${nodeName}...`);

  // Check if we have WebSocket data for this node
  if (useWebSocketData && webSocketNodeData[nodeName]) {
    console.log(`[fetchNodeData] Using WebSocket data for ${nodeName}`);
    return webSocketNodeData[nodeName];
  }

  // Direct fetch fallback if WebSocket fails
  if (useDirectFetch) {
    try {
      console.log(`[fetchNodeData] Using direct fetch for ${nodeName}`);
      const response = await fetch(`http://localhost:5000/node/${nodeName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`[fetchNodeData] Direct fetch failed for ${nodeName}:`, error);
    }
  }

  // Fall back to simulated data if all else fails
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        changeText: `This is simulated data for ${nodeName}.`,
        reasonText: `WebSocket and direct fetch failed. Using fallback data.`,
      };
      console.log(`[fetchNodeData] Fallback data for ${nodeName}:`, data);
      resolve(data);
    }, 1000);
  });
};

// WebSocket connection with multiple fallback options
export const connectToWebSocket = (sessionId, onNodeUpdate, onScoreUpdate) => {
  // Try direct WebSocket first
  let socket = null;

  const tryDirectWebSocket = () => {
    // Only try if Socket.io is available
    if (typeof io === 'undefined') {
      console.error('Socket.io not found. Will try proxy connection.');
      tryProxyWebSocket();
      return null;
    }

    console.log("Attempting direct WebSocket connection...");

    try {
      socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000,
        query: { sessionId }
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket server with session ID:", sessionId);
        setUseWebSocketData(true);
        setUseDirectFetch(false);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
        setUseWebSocketData(false);
        // Try direct HTTP fetch as fallback
        setUseDirectFetch(true);
      });

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        // Try proxy WebSocket if direct connection fails
        socket.close();
        tryProxyWebSocket();
      });

      socket.on("node_completed", (data) => {
        console.log("Node completed:", data);
        updateNodeDataFromWebSocket(data.node_name, data.node_data);
        if (onNodeUpdate) onNodeUpdate(data.node_name, data.node_data);

        // If evaluation node, update score data
        if (data.node_name === "PromptEvaluationNode" && data.node_data?.overall_score) {
          const scoreData = {
            score: Math.round(data.node_data.overall_score * 10),
            scoreRationale: data.node_data.scores
              ? `Scores: ${Object.entries(data.node_data.scores)
                .map(([dim, score]) => `${dim}: ${score}/10`)
                .join(', ')}`
              : "Evaluation complete",
            improvementTips: `${data.node_data.suggestions_count || 0} improvement suggestions available.`
          };

          if (onScoreUpdate) onScoreUpdate(scoreData);
        }
      });

      return socket;
    } catch (error) {
      console.error("Error setting up direct WebSocket:", error);
      tryProxyWebSocket();
      return null;
    }
  };

  const tryProxyWebSocket = () => {
    console.log("Attempting proxy WebSocket connection via background script...");

    // Check if we're in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      // Try to proxy through the background script
      chrome.runtime.sendMessage({
        type: "PROXY_WEBSOCKET",
        url: "ws://localhost:5000/socket.io/?EIO=4&transport=websocket"
      }, (response) => {
        if (response && response.connectionId) {
          console.log("Proxy WebSocket connection established with ID:", response.connectionId);

          // Listen for WebSocket events from the background script
          chrome.runtime.onMessage.addListener((message) => {
            if (message.connectionId === response.connectionId) {
              switch (message.type) {
                case "WEBSOCKET_MESSAGE":
                  // Parse and handle the WebSocket message
                  try {
                    const data = JSON.parse(message.data);
                    if (data.event === "node_completed") {
                      updateNodeDataFromWebSocket(data.data.node_name, data.data.node_data);
                      if (onNodeUpdate) onNodeUpdate(data.data.node_name, data.data.node_data);
                    }
                  } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                  }
                  break;

                case "WEBSOCKET_ERROR":
                case "WEBSOCKET_CLOSE":
                  console.log("WebSocket proxy connection closed or error occurred");
                  setUseDirectFetch(true);
                  break;
              }
            }
          });

          setUseWebSocketData(true);
        } else {
          console.error("Failed to establish proxy WebSocket connection");
          setUseDirectFetch(true);
        }
      });
    } else {
      console.error("Not in a Chrome extension context, cannot use proxy WebSocket");
      setUseDirectFetch(true);
    }
  };

  // Start with direct WebSocket attempt
  return tryDirectWebSocket();
};