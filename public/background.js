// background.js - Background script to handle all communication with backend
// This runs in the extension's background context which isn't restricted by ChatGPT's CSP

importScripts(chrome.runtime.getURL('socket.io.min.js'));

// Store active connections
const activeConnections = {};
let socket = null;

// Connect to backend via Socket.io
function connectToBackend(sessionId) {
  console.log("Background script connecting to backend for session:", sessionId);

  // Clean up any existing connection
  if (socket) {
    console.log("Closing existing socket connection");
    socket.disconnect();
  }

  // Create new connection
  socket = io("http://127.0.0.1:5000", {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    query: { sessionId }
  });

  socket.on("connect", () => {
    console.log("Background: WebSocket connected with ID:", socket.id);
    // Store connection for this session
    activeConnections[sessionId] = {
      socket,
      connected: true,
      lastActivity: Date.now(),
      nodeData: {}
    };

    // Notify any content scripts that socket is connected
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: "SOCKET_CONNECTED",
          sessionId
        }).catch(err => console.log("Tab not ready:", err));
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Background: WebSocket disconnected");
    if (activeConnections[sessionId]) {
      activeConnections[sessionId].connected = false;
    }

    // Notify content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: "SOCKET_DISCONNECTED",
          sessionId
        }).catch(err => console.log("Tab not ready:", err));
      });
    });
  });

  socket.on("node_completed", (data) => {
    console.log("Background: Node completed event received:", data);

    // Store node data
    if (activeConnections[sessionId]) {
      activeConnections[sessionId].nodeData[data.node_name] = data.node_data;
      activeConnections[sessionId].lastActivity = Date.now();
    }

    // Forward to content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: "NODE_COMPLETED",
          sessionId,
          nodeName: data.node_name,
          nodeData: data.node_data
        }).catch(err => console.log("Tab not ready:", err));
      });
    });
  });

  socket.on("connect_error", (error) => {
    console.error("Background: WebSocket connect error:", error);

    // Try polling if WebSocket fails
    if (socket.io.opts.transports.includes("websocket")) {
      console.log("Background: Falling back to polling transport");
      socket.io.opts.transports = ["polling"];
    }
  });

  return socket.connected;
}

// Handle direct API calls to backend
async function callBackendAPI(endpoint, method, data) {
  console.log(`Background: Calling API ${method} ${endpoint}`, data);

  try {
    const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`Background: API ${endpoint} response:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Background: API ${endpoint} error:`, error);
    throw error;
  }
}

// Message handling from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background: Received message:", request);

  // Handle different message types
  switch (request.type) {
    case "CONNECT_SOCKET":
      const connected = connectToBackend(request.sessionId);
      sendResponse({ success: true, connected });
      break;

    case "CHECK_SOCKET_STATUS":
      const status = activeConnections[request.sessionId] || { connected: false };
      sendResponse({
        connected: status.connected,
        lastActivity: status.lastActivity
      });
      break;

    case "GET_NODE_DATA":
      const nodeData = activeConnections[request.sessionId]?.nodeData[request.nodeName];
      sendResponse({ data: nodeData || null });
      break;

    case "API_CALL":
      // Handle API calls
      callBackendAPI(request.endpoint, request.method, request.data)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({
          success: false,
          error: error.message
        }));
      return true; // Keep connection alive for async response

    case "DISCONNECT_SOCKET":
      if (socket) {
        socket.disconnect();
        delete activeConnections[request.sessionId];
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No active socket" });
      }
      break;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }

  // Return true to use sendResponse asynchronously
  return true;
});

// Clean up inactive connections periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(activeConnections).forEach(sessionId => {
    const connection = activeConnections[sessionId];
    // If inactive for more than 30 minutes
    if (now - connection.lastActivity > 30 * 60 * 1000) {
      console.log(`Cleaning up inactive connection: ${sessionId}`);
      if (connection.socket) {
        connection.socket.disconnect();
      }
      delete activeConnections[sessionId];
    }
  });
}, 5 * 60 * 1000); // Check every 5 minutes