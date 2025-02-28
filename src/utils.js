// utils.js - Contains helper functions.

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

// Use WebSocket data when available, fall back to simulated data when testing
let useWebSocketData = false;
let webSocketNodeData = {};

// Function to set WebSocket data availability
export const setUseWebSocketData = (value) => {
  useWebSocketData = value;
};

// Function to update node data from WebSocket
export const updateNodeDataFromWebSocket = (nodeName, data) => {
  webSocketNodeData[nodeName] = data;
};

// Fetch node data - tries WebSocket data first, falls back to simulated data
export const fetchNodeData = async (nodeName) => {
  console.log(`[fetchNodeData] Fetching data for ${nodeName}...`);

  // Check if we have WebSocket data for this node
  if (useWebSocketData && webSocketNodeData[nodeName]) {
    console.log(`[fetchNodeData] Using WebSocket data for ${nodeName}`);
    return webSocketNodeData[nodeName];
  }

  // Fall back to simulated data for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        changeText: `This is the change for ${nodeName}.`,
        reasonText: `Reason why ${nodeName} made this change.`,
      };
      console.log(`[fetchNodeData] Data for ${nodeName}:`, data);
      resolve(data);
    }, 1000); // Reduced timeout for better testing experience
  });
};

// Similar pattern for score data
let webSocketScoreData = null;

export const updateScoreDataFromWebSocket = (data) => {
  webSocketScoreData = data;
};

export const fetchScoreData = async () => {
  console.log("[fetchScoreData] Fetching score data...");

  // Check if we have WebSocket score data
  if (useWebSocketData && webSocketScoreData) {
    console.log("[fetchScoreData] Using WebSocket score data");
    return webSocketScoreData;
  }

  // Fall back to simulated data for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        score: 55,
        scoreRationale: "Your prompt was clear but could be more detailed. (Hardcoded)",
        improvementTips: "Consider adding more context and specifics to your prompt. (HardCoded)",
      };
      console.log("[fetchScoreData] Data:", data);
      resolve(data);
    }, 2000); // Reduced timeout for better testing experience
  });
};

// WebSocket connection management
export const connectToWebSocket = (sessionId, onNodeUpdate, onScoreUpdate) => {
  // Check if socket.io is available
  if (typeof io === 'undefined') {
    console.error('Socket.io not found. WebSocket features disabled.');
    return null;
  }

  const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    query: { sessionId }
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server with session ID:", sessionId);
    setUseWebSocketData(true);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
    setUseWebSocketData(false);
  });

  socket.on("node_completed", (data) => {
    console.log("Node completed:", data);

    // Update node data
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

      updateScoreDataFromWebSocket(scoreData);
      if (onScoreUpdate) onScoreUpdate(scoreData);
    }
  });

  return socket;
};




///Below are not being used

export const formatMarkdown = async (text) => {
  return simpleMarkdown.parse(text);
};

export const simpleMarkdown = {
  parse: (text) => {
    // Remove standalone dashes (---)
    text = text.replace(/^---\s*$/gm, '');

    // Replace headers
    text = text.replace(/^### (.*$)/gm, '<h3 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h1>');

    // Replace bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #DD5B8A; display: inline-block; margin-top: 0.5em;">$1</strong>');

    // Add extra spacing between sections (Role:, Desired Output:, etc.)
    text = text.replace(/(Role:|Desired Output:|Enhanced Prompt:|Answer:)/g, '<div style="margin-top: 1.5em; margin-bottom: 0.5em;"><span style="color: #DD5B8A;">$1</span></div>');

    // Replace paragraphs (but not right after section headers)
    text = text.split(/\n\n+/).map(para => {
      if (!para.match(/(Role:|Desired Output:|Enhanced Prompt:|Answer:)/)) {
        return `<p style="margin: 0.5em 0;">${para.trim()}</p>`;
      }
      return para;
    }).join('\n');

    // Replace single newlines with line breaks
    text = text.replace(/([^\n])\n([^\n])/g, '$1<br>$2');

    // Replace bullet points
    text = text.replace(/^- (.+)$/gm, '<ul style="margin: 0.5em 0; padding-left: 1.5em;"><li>$1</li></ul>');

    return `<div style="line-height: 1.6; color: white;">${text}</div>`;
  }
}