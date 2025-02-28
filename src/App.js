import React, { useState, useEffect } from "react";
import IslandButton from "./IslandButton";
import Sidebar from "./Sidebar";
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
  const [sessionId] = useState(() => window.enhancerAPI?.getSessionId() || `session-${Date.now()}`);

  // Listen for node updates from background script
  useEffect(() => {
    console.log("🚀 Setting up node update listener...");

    // Skip if enhancerAPI is not available
    if (!window.enhancerAPI || !window.enhancerAPI.onNodeUpdate) {
      console.error("❌ enhancerAPI.onNodeUpdate not available");
      return;
    }

    // Set up listener for node updates
    const removeListener = window.enhancerAPI.onNodeUpdate((nodeName, nodeData) => {
      console.log("📦 NODE COMPLETED EVENT RECEIVED:", nodeName);

      // Add to status list
      setNodeStatusList(prev => {
        const newList = [...prev, {
          time: new Date().toLocaleTimeString(),
          node_name: nodeName,
          data: nodeData
        }];
        console.log("Updated node list, now contains:", newList.length, "items");
        return newList;
      });

      // Handle specific nodes
      if (nodeName === "PromptEvaluationNode" && nodeData) {
        if (nodeData.overall_score) {
          const newScore = Math.round(nodeData.overall_score * 10);
          console.log("📊 Setting score:", newScore);
          setScore(newScore);

          // Set rationale and tips
          if (nodeData.scores) {
            setScoreRationale(`Scores: ${Object.entries(nodeData.scores)
              .map(([dim, score]) => `${dim}: ${score}/10`)
              .join(', ')}`);
          }

          setImprovementTips(`${nodeData.suggestions_count || 0} improvement suggestions available.`);
        }
      }

      if (nodeName === "FinalAnswerNode") {
        console.log("🏁 Final node completed");
        setIsLoading(false);
      }
    });

    // Clean up listener when component unmounts
    return () => {
      console.log("Removing node update listener");
      removeListener();
    };
  }, []);

  // Listen for settings updates
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "SETTINGS_UPDATE") {
        setAlwaysShowInsights(event.data.alwaysShowInsights);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Main function to send prompt to backend
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

      // Call enhancer API
      console.log("🔄 Calling enhancer API with session ID:", sessionId);

      // Use the enhancerAPI if available, otherwise use fallback
      let data;
      if (window.enhancerAPI) {
        data = await window.enhancerAPI.enhancePrompt(prompt, sessionId);
      } else if (window.callEnhancerAPI) {
        data = await window.callEnhancerAPI(prompt, sessionId);
      } else {
        // Last resort fallback
        console.error("⚠️ No API functions available. Using simple prompt enhancement.");
        data = {
          enhancedPrompt: `# Task\n${prompt}\n\n# Desired Output\n- Clear, well-structured response\n- Accurate information\n\n# Context\nPlease be thorough in your response.`,
          _fallback: true
        };
      }

      console.log("✅ API call complete, received data:", data);

      // If we have an enhanced prompt, use it
      if (data.enhancedPrompt) {
        console.log("📝 Setting enhanced prompt");
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
    setEnhancedPrompt("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setNodeStatusList([]);
    setIsSidebarVisible(false);
  };

  // Reset everything when the user runs optimize again
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

  // Function to get node data
  const getNodeData = (nodeName) => {
    console.log(`Looking for node data for ${nodeName} in list of ${nodeStatusList.length} items`);

    // First try to get from local node status list
    const nodeStatus = nodeStatusList.find(status =>
      status.node_name === nodeName ||
      (status.data && status.data.node_type === nodeName)
    );

    if (nodeStatus?.data) {
      return nodeStatus.data;
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
      enhancedPrompt,
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
    </div>
  );
}

export default App;