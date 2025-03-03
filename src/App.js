import React, { useState, useEffect } from "react";
import IslandButton from "./IslandButton";
import Sidebar from "./Sidebar";
import {
  scrape,
  fetchNodeData,
  fetchScoreData,
  injectPrompt,
} from "./utils";

function App() {
  const [alwaysShowInsights, setAlwaysShowInsights] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [score, setScore] = useState(null);
  const [scoreRationale, setScoreRationale] = useState("");
  const [improvementTips, setImprovementTips] = useState("");
  const [optimizationRun, setOptimizationRun] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      const prompt = scrape();
      if (!prompt) return;
      setOriginalPrompt(prompt);

      // const data = await window.callEnhancerAPI(prompt);

      // hardcoded, comment this out when doing backend stuff
      const data = {
        enhancedPrompt: "This is a hardcoded enhanced prompt.",
        answer: "This is a hardcoded answer.",
      };

      injectPrompt(data.enhancedPrompt);

      // Simulated API call to fetch score data.
      const scoreData = await fetchScoreData();
      setScore(scoreData.score);
      setScoreRationale(scoreData.scoreRationale);
      setImprovementTips(scoreData.improvementTips);
    } catch (error) {
      console.error("Error in sendToEngine:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
      // setIsLoading(false);
      
    }
  };

  //reset everything when the user cancels
  const restoreOriginal = () => {
    injectPrompt(originalPrompt);
    setOriginalPrompt("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setIsSidebarVisible(false);
  };

  // resets everything when the users runs optimize again
  const runOptimization = () => {
    setOriginalPrompt("");
    setScore(null);
    setScoreRationale("");
    setImprovementTips("");
    setOptimizationRun((prev) => prev + 1);
    if (alwaysShowInsights) {
      setIsSidebarVisible(true);
    }
    sendToEngine();
  };

  const showInsights = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);

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
  fetchNodeData={fetchNodeData}
  optimizationRun={optimizationRun}
  isLoading={isLoading}
/>
    </div>
  );
}

export default App;
