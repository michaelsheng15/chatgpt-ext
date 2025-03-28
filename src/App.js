import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { scrape, injectPrompt } from "./utils";
import PortalIslandButton from "./PortalIslandButton";
function App() {
  const [alwaysShowInsights, setAlwaysShowInsights] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [nodeOutput, setNodeOutput] = useState("");
  const [score, setScore] = useState(null);
  const [scoreRationale, setScoreRationale] = useState("");
  const [improvementTips, setImprovementTips] = useState("");
  const [optimizationRun, setOptimizationRun] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [nodeStatusList, setNodeStatusList] = useState([]);
  const [sessionId] = useState(() => window.enhancerAPI?.getSessionId() || `session-${Date.now()}`);

  // Create a stable reference for the setNodeStatusList function using useCallback
  const updateNodeStatusList = useCallback((newNode) => {
    console.log("Adding node to status list:", newNode);
    setNodeStatusList(prev => {
      const newList = [...prev, newNode];
      console.log("Updated node list, now contains:", newList.length, "items");
      return newList;
    });
  }, []);

  // Listen for node updates from background script via window.postMessage
  useEffect(() => {
    console.log("🚀 Setting up node update listener...");

    const handleMessage = (event) => {
      // Only handle messages posted by content.js
      if (event.source !== window || !event.data) return;

      if (event.data.type === "NODE_COMPLETED") {
        const { node_name, node_type, node_output } = event.data;
        console.log("📦 NODE COMPLETED EVENT RECEIVED:", node_name || node_type);

        // Add to status list
        const newNode = {
          time: new Date().toLocaleTimeString(),
          node_name: node_name || node_type,
          node_type: node_type || node_name,
          node_output: node_output
        };

        updateNodeStatusList(newNode);

        // Handle specific nodes (PromptEvaluationNode, FinalAnswerNode, etc.)
        if ((node_name === "PromptEvaluationNode" || node_type === "PromptEvaluationNode") && node_output) {
          if (node_output.score) {
            const newScore = node_output.score;
            console.log("📊 Setting score:", newScore);
            setScore(newScore);

            if (node_output.justification) {
              setScoreRationale(node_output.justification);
            }

            if (node_output.suggestions) {
              setImprovementTips(
                node_output.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join("\n")
              );
            }
          }
        }

        // Check if we got the enhanced prompt
        if ((node_name === "PromptEnhancerNode" || node_type === "PromptEnhancerNode") && node_output) {
          console.log("📝 Setting enhanced prompt from node output");
          setNodeOutput(node_output);
          // Only inject the prompt if we haven't already done so
          if (!nodeOutput) {
            injectPrompt(node_output);
          }
        }

        if ((node_name === "PromptEvaluationNode" || node_type === "PromptEvaluationNode")) {
          console.log("🏁 Prompt enhancer completed");

          setTimeout(() => {
            setIsLoading(false);
          }, 3000);
        }
      }

      // Log other message types for debugging
      if (event.data.type && event.data.type !== "NODE_COMPLETED") {
        console.log("Other message received:", event.data.type);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      console.log("Removing node update listener");
      window.removeEventListener("message", handleMessage);
    };
  }, [nodeOutput, updateNodeStatusList]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "SETTINGS_UPDATE") {
        setAlwaysShowInsights(event.data.alwaysShowInsights);
      } else if (event.data && event.data.type === "SEND_BUTTON_CLICKED") {
        handleSendButtonClick();
      } else if (event.data && event.data.type === "OPTIMIZE_BUTTON_CLICKED") {
        setIsSidebarVisible(true);
        setTimeout(() => {
          runOptimization();
        }, 25);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isSidebarVisible]);

  // Main function to send prompt to engine
  const sendToEngine = async () => {
    setIsLoading(true);
    setNodeStatusList([]); // Reset node status list
    console.log("🚀 Starting optimization process");

    try {
      // Force sidebar to be visible if it's not already
      if (!isSidebarVisible && alwaysShowInsights == true) {
        console.log("Opening sidebar since it wasn't visible");
        setIsSidebarVisible(true);
      }

      const prompt = scrape();
      if (!prompt) {
        console.error("⚠️ No prompt found");
        setIsLoading(false);
        return;
      }

      console.log("📝 Original prompt:", prompt);
      setOriginalPrompt(prompt);

      // Call enhancer API
      console.log("🔄 Calling enhancer API with session ID:", sessionId);

      // Use the enhancerAPI if available, otherwise use fallback
      let data;
      if (window.enhancerAPI) {
        try {
          data = await window.enhancerAPI.enhancePrompt(prompt, sessionId);
          console.log("API call successful:", data);
        } catch (apiError) {
          console.error("API call failed:", apiError);
        }
      } else if (window.callEnhancerAPI) {
        try {
          data = await window.callEnhancerAPI(prompt, sessionId);
        } catch (apiError) {
          console.error("API call failed:", apiError);
        }
      } else {
        // Last resort fallback
        console.error("⚠️ No API functions available. Using simple prompt enhancement.");
      }

      console.log("✅ API call complete, received data:", data);

      // If we have an enhanced prompt, use it
      if (data.nodeOutput) {
        console.log("📝 Setting enhanced prompt");
        setNodeOutput(data.nodeOutput);
        injectPrompt(data.nodeOutput);
      }

      // If no WebSocket updates were received, handle it here
      setTimeout(() => {
        if (nodeStatusList.length === 0 && isLoading) {
          console.log("⚠️ No WebSocket updates received, setting loading to false");
          setIsLoading(false);

          // Set a default score if none was received
          if (score === null) {
            setScore(50);
            setScoreRationale("Score estimated as real-time updates were not received.");
            setImprovementTips("Consider checking the backend connection for real-time updates.");
          }
        }
      }, 10000);

    } catch (error) {
      console.error("❌ Error in sendToEngine:", error);
      setIsLoading(false);

      // Set fallback score
      setScore(30);
      setScoreRationale("Error connecting to enhancement service.");
      setImprovementTips("Check that the backend server is running at localhost:5000.");
    }
  };

  // Reset everything when the user cancels
  const restoreOriginal = () => {
    injectPrompt(originalPrompt);
    setOriginalPrompt("");
    setNodeOutput("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setNodeStatusList([]);
    setIsSidebarVisible(false);
  };

  const handleSendButtonClick = useCallback(() => {
    console.log("prompt sent");
    setOriginalPrompt("");
    setIsSidebarVisible(false);
  }, []);

  // Reset everything when the user runs optimize again
  const runOptimization = useCallback(() => {
    setOriginalPrompt("");
    setIsSidebarVisible(true);
    setNodeOutput("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setNodeStatusList([]);
    setOptimizationRun((prev) => prev + 1);

    setTimeout(() => {
      sendToEngine();
    }, 25);
  }, []);

  const showInsights = () => {
    console.log("showInsights called, setting sidebar to visible");
    setIsSidebarVisible(true);
  };

  const closeSidebar = () => {
    console.log("closeSidebar called, setting sidebar to hidden");
    setIsSidebarVisible(false);
  };

  // Function to get node data
  const getNodeData = (nodeName) => {
    console.log(`Looking for node data for ${nodeName} in list of ${nodeStatusList.length} items`);

    // First try to get from local node status list
    const nodeStatus = nodeStatusList.find(status =>
      status.node_name === nodeName ||
      status.node_type === nodeName
    );

    if (nodeStatus?.node_output) {
      return nodeStatus.node_output;
    }

    // If not found locally and enhancerAPI is available, try to get from backend
    if (window.enhancerAPI && window.enhancerAPI.getNodeData) {
      // Return a promise that will be handled by the NodeBlock component
      return window.enhancerAPI.getNodeData(nodeName);
    }

    // If all else fails, return null
    return null;
  };

  // Debug function - can be triggered from browser console
  window.debugAppState = () => {
    console.log({
      sessionId,
      isLoading,
      isSidebarVisible,
      nodeStatusList: nodeStatusList.length,
      originalPrompt,
      nodeOutput,
      score,
      apiAvailable: typeof window.enhancerAPI !== 'undefined'
    });

    // Check connection status if API is available
    if (window.enhancerAPI && window.enhancerAPI.checkConnectionStatus) {
      window.enhancerAPI.checkConnectionStatus()
        .then(status => console.log("Connection status:", status))
        .catch(error => console.error("Error checking connection:", error));
    }
  };

  // For debugging - log when isSidebarVisible changes
  useEffect(() => {
    console.log("isSidebarVisible changed to:", isSidebarVisible);
  }, [isSidebarVisible]);

  return (
    <div>
      <PortalIslandButton
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
    </div>
  );
}

export default App;