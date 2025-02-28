import React, { useState, useEffect } from "react";
import IslandButton from "./IslandButton";
import Sidebar from "./Sidebar";
import SocketDebugger from "./SocketDebugger"; // Import the debugger (temporary)
import {
  scrape,
  injectPrompt,
} from "./utils";

function App() {
  const [alwaysShowInsights, setAlwaysShowInsights] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [score, setScore] = useState(null);
  const [scoreRationale, setScoreRationale] = useState("");
  const [improvementTips, setImprovementTips] = useState("");
  const [optimizationRun, setOptimizationRun] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [nodeStatusList, setNodeStatusList] = useState([]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [socket, setSocket] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Toggle for debugger visibility

  // Direct WebSocket connection
  useEffect(() => {
    console.log("🚀 Initializing WebSocket connection...");

    // Create a function to load socket.io if needed
    const loadSocketIO = () => {
      return new Promise((resolve, reject) => {
        if (typeof io !== 'undefined') {
          console.log("✅ Socket.io already loaded");
          resolve();
          return;
        }

        console.log("❌ Socket.io not available - loading it directly");
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
        
        script.onload = () => {
          console.log("✅ Socket.io loaded via script");
          resolve();
        };
        
        script.onerror = (err) => {
          console.error("Failed to load Socket.io:", err);
          reject(err);
        };
        
        document.head.appendChild(script);
      });
    };

    // Initialize socket after ensuring Socket.io is loaded
    const initializeSocket = async () => {
      try {
        await loadSocketIO();
        
        console.log("🔌 Creating Socket.io connection to http://localhost:5000");
        const socketInstance = io("http://localhost:5000", {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 10000
        });

        socketInstance.on("connect", () => {
          console.log("✅ WebSocket CONNECTED with ID:", socketInstance.id);
          // Send a test message to verify connection
          socketInstance.emit("test_connection", { 
            message: "Hello from frontend", 
            sessionId,
            timestamp: Date.now()
          });
        });

        socketInstance.on("connect_error", (err) => {
          console.error("❌ WebSocket CONNECTION ERROR:", err);
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("🔌 WebSocket DISCONNECTED:", reason);
        });

        // Listen for ANY event (debugging)
        socketInstance.onAny((eventName, ...args) => {
          console.log(`📡 SOCKET EVENT [${eventName}]:`, args);
        });

        socketInstance.on("node_completed", (data) => {
          console.log("📦 NODE COMPLETED EVENT:", data);

          // Add to status list
          setNodeStatusList(prev => {
            const newList = [...prev, {
              time: new Date().toLocaleTimeString(),
              node_name: data.node_name,
              data: data.node_data
            }];
            console.log("Updated node list:", newList);
            return newList;
          });

          // Handle specific nodes
          if (data.node_name === "PromptEvaluationNode" && data.node_data) {
            if (data.node_data.overall_score) {
              const newScore = Math.round(data.node_data.overall_score * 10);
              console.log("📊 Setting score:", newScore);
              setScore(newScore);
              
              // Also set rationale and tips if available
              if (data.node_data.scores) {
                const rationale = `Scores: ${Object.entries(data.node_data.scores)
                  .map(([dim, score]) => `${dim}: ${score}/10`)
                  .join(', ')}`;
                setScoreRationale(rationale);
              }
              
              if (data.node_data.suggestions_count) {
                setImprovementTips(`${data.node_data.suggestions_count} improvement suggestions available.`);
              }
            }
          }

          if (data.node_name === "FinalAnswerNode") {
            console.log("🏁 Final node completed");
            setIsLoading(false);
          }
        });

        setSocket(socketInstance);
        console.log("Socket instance set:", socketInstance.id);

        return socketInstance;
      } catch (err) {
        console.error("❌ Error initializing socket:", err);
        return null;
      }
    };

    // Execute the initialization
    const socketInstance = initializeSocket();
    
    // Cleanup function
    return () => {
      if (socket) {
        console.log("Disconnecting socket on cleanup");
        socket.disconnect();
      }
    };
  }, []); // Only run once on mount

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "SETTINGS_UPDATE") {
        setAlwaysShowInsights(event.data.alwaysShowInsights);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendToEngine = async () => {
    setIsLoading(true);
    setNodeStatusList([]); // Reset node status list
    console.log("🚀 Starting optimization process");

    try {
      const prompt = scrape();
      if (!prompt) {
        console.error("⚠️ No prompt found");
        setIsLoading(false);
        return;
      }

      console.log("📝 Original prompt:", prompt);
      setOriginalPrompt(prompt);

      // Make the API call with sessionId
      console.log("🔄 Calling enhancer API with session ID:", sessionId);

      // Add the call to the browser console for debugging
      console.log(`fetch('http://localhost:5000/enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "${prompt.replace(/"/g, '\\"')}", sessionId: "${sessionId}" })
      }).then(r => r.json()).then(console.log)`);

      const response = await fetch('http://localhost:5000/enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API call complete, received data:", data);

      // The final response will have these
      if (data.enhancedPrompt) {
        console.log("📝 Setting final enhanced prompt from API response");
        setEnhancedPrompt(data.enhancedPrompt);
        injectPrompt(data.enhancedPrompt);
      }

      // If no WebSocket updates were received, handle it here
      setTimeout(() => {
        if (nodeStatusList.length === 0 && isLoading) {
          console.log("⚠️ No WebSocket updates received, setting loading to false");
          setIsLoading(false);

          // Set a default score if none was received
          if (score === null) {
            setScore(50);
            setScoreRationale("Score estimated as WebSocket updates were not received.");
            setImprovementTips("Consider checking the backend connection for real-time updates.");
          }
        }
      }, 10000);

    } catch (error) {
      console.error("❌ Error in sendToEngine:", error);
      setIsLoading(false);
    }
  };

  //reset everything when the user cancels
  const restoreOriginal = () => {
    injectPrompt(originalPrompt);
    setOriginalPrompt("");
    setEnhancedPrompt("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setNodeStatusList([]);
    setIsSidebarVisible(false);
  };

  // resets everything when the users runs optimize again
  const runOptimization = () => {
    setOriginalPrompt("");
    setEnhancedPrompt("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setNodeStatusList([]);
    setOptimizationRun((prev) => prev + 1);
    if (alwaysShowInsights) {
      setIsSidebarVisible(true);
    }
    sendToEngine();
  };

  const showInsights = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
    console.log("Debug mode:", !debugMode);
  };

  // Custom function to get node data
  const getNodeData = (nodeName) => {
    console.log(`Looking for node data for ${nodeName} in list of ${nodeStatusList.length} items`);
    const nodeStatus = nodeStatusList.find(status =>
      status.node_name === nodeName ||
      (status.data && status.data.node_type === nodeName)
    );
    return nodeStatus?.data || null;
  };

  // Debug function - can be triggered from browser console
  window.debugAppState = () => {
    console.log({
      sessionId,
      isLoading,
      isSidebarVisible,
      socket: socket ? "Connected" : "Not connected",
      socketId: socket?.id,
      nodeStatusList: nodeStatusList.length,
      originalPrompt,
      enhancedPrompt,
      score
    });
    
    // Print the full nodeStatusList for debugging
    console.log("Full nodeStatusList:", nodeStatusList);
  };

  return (
    <div>
      <IslandButton
        alwaysShowInsights={alwaysShowInsights}
        isSidebarVisible={isSidebarVisible}
        runOptimization={runOptimization}
        showInsights={showInsights}
        closeSidebar={closeSidebar}
        restoreOriginal={restoreOriginal}
        score={score}
        isLoading={isLoading}
      />
      <Sidebar
        isOpen={isSidebarVisible}
        onClose={closeSidebar}
        score={score}
        scoreRationale={scoreRationale}
        improvementTips={improvementTips}
        fetchNodeData={getNodeData}
        optimizationRun={optimizationRun}
        isLoading={isLoading}
        nodeStatusList={nodeStatusList}
      />
      
      {/* Debug button - bottom left corner */}
      <button 
        onClick={toggleDebugMode}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          zIndex: 10000,
          background: '#333',
          color: 'white',
          padding: '5px 10px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {debugMode ? "Hide Debug" : "Show Debug"}
      </button>
      
      {/* Debug component */}
      {debugMode && <SocketDebugger sessionId={sessionId} />}
    </div>
  );
}

export default App;