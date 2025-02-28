import React, { useEffect } from "react";
import NodeBlock from "./NodeBlock";
import { Box, Paper, Typography, Button, keyframes } from "@mui/material";

// Slide-up animation for loading blocks
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function Sidebar({
  isOpen,
  onClose,
  score,
  scoreRationale,
  improvementTips,
  fetchNodeData,
  optimizationRun,
  isLoading,
  nodeStatusList,
}) {
  const blueColor = "#2196f3";

  // Enhanced logging when node status list changes
  useEffect(() => {
    console.log("Sidebar received nodeStatusList update:", nodeStatusList);
    console.log("NodeStatusList length:", nodeStatusList.length);

    // Log some sample data if available
    if (nodeStatusList.length > 0) {
      console.log("Latest node update:", nodeStatusList[nodeStatusList.length - 1]);
    }
  }, [nodeStatusList]);

  const getScoreColor = (score) => {
    if (score >= 75) return "green";
    if (score >= 40) return "orange";
    return "red";
  };

  // Define the order and names of nodes to display in the sidebar
  const nodeDisplayOrder = [
    // { id: "OriginalPromptNode", label: "Original Prompt Analysis" },
    { id: "CategorizePromptNode", label: "Prompt Categorization" },
    { id: "QueryDisambiguationNode", label: "Disambiguation Check" },
    { id: "RephraseNode", label: "Prompt Rephrasing" },
    { id: "PromptEnhancerNode", label: "Prompt Enhancement" },
    { id: "PromptEvaluationNode", label: "Prompt Evaluation" },
    { id: "FinalAnswerNode", label: "Final Response Generation" },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 300,
        height: "100%",
        backgroundColor: "white",
        color: blueColor,
        boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.2)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
        zIndex: 999,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        overflowY: "auto",
      }}
    >
      {/* Dynamic Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          color: isLoading ? blueColor : getScoreColor(score),
        }}
      >
        {isLoading ? "Hold tight, we're supercharging your prompts! ⚡️" : `Score: ${score ?? "--"}`}
      </Typography>

      {isLoading ? (
        // Real-time node status updates
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Debug information - display nodeStatusList length */}
          <Paper sx={{ p: 1, bgcolor: "#f5f5f5" }}>
            <Typography variant="caption">
              Received {nodeStatusList.length} updates
            </Typography>
          </Paper>

          {nodeStatusList.length > 0 ? (
            // If we have actual updates, show them
            nodeStatusList.map((status, index) => (
              <Paper
                key={`node-update-${index}-${status.time || Date.now()}`} // Ensure unique keys
                sx={{
                  backgroundColor: "#007DE0",
                  color: "white",
                  p: 1,
                  borderRadius: "8px",
                  textAlign: "left",
                  width: "100%",
                  opacity: 0,
                  animation: `${slideUp} 0.8s forwards`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {status.node_name} {status.time ? `- ${status.time}` : ''}
                </Typography>
                {status.data?.category && (
                  <Typography variant="body2">
                    Category: {status.data.category}
                  </Typography>
                )}
                {status.data?.current_step && (
                  <Typography variant="body2">
                    Step: {status.data.current_step}
                  </Typography>
                )}
                {/* Display other relevant properties */}
                {status.data?.clarification_question && (
                  <Typography variant="body2">
                    Clarification: {status.data.clarification_question}
                  </Typography>
                )}
                {status.data?.rephrased_question && (
                  <Typography variant="body2">
                    Rephrased: Yes
                  </Typography>
                )}
                {status.data?.overall_score && (
                  <Typography variant="body2">
                    Score: {(status.data.overall_score * 10).toFixed(0)}/100
                  </Typography>
                )}
                {status.data?.status && (
                  <Typography variant="body2">
                    Status: {status.data.status}
                  </Typography>
                )}
              </Paper>
            ))
          ) : (
            // Fallback to placeholder blocks if no updates yet
            ["Initializing process...", "Analyzing prompt...", "Almost done..."].map((text, index) => (
              <Paper
                key={`placeholder-${index}`}
                sx={{
                  backgroundColor: "#007DE0",
                  color: "white",
                  p: 1,
                  borderRadius: "8px",
                  textAlign: "left",
                  width: "100%",
                  opacity: 0,
                  animation: `${slideUp} 0.8s forwards`,
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                <Typography variant="body2">
                  {text}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd" }}>
            <Typography variant="h6">Why this score?</Typography>
            <Typography variant="body2">{scoreRationale || "No explanation available."}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd" }}>
            <Typography variant="h6">Improvement tips</Typography>
            <Typography variant="body2">{improvementTips || "No suggestions available."}</Typography>
          </Paper>

          <Box sx={{ width: "100%" }}>
            <Typography variant="h6">Changes Made</Typography>
            {nodeDisplayOrder.map((node) => (
              <NodeBlock
                key={`node-${node.id}-${optimizationRun}`}
                nodeName={node.id}
                nodeLabel={node.label}
                fetchNodeData={fetchNodeData}
              />
            ))}
          </Box>

          {/* Debug info - always show during development */}
          <Paper variant="outlined" sx={{ p: 1, width: "100%", mt: 2, bgcolor: "#f5f5f5" }}>
            <Typography variant="subtitle2">Debug Info</Typography>
            <Typography variant="body2">Node updates: {nodeStatusList.length}</Typography>
            <Typography variant="body2">Score: {score}</Typography>
            <Typography variant="caption" sx={{ display: "block", whiteSpace: "pre-wrap" }}>
              Last update: {nodeStatusList.length > 0 ?
                JSON.stringify(nodeStatusList[nodeStatusList.length - 1], null, 2).substring(0, 100) + "..." :
                "None"}
            </Typography>
          </Paper>
        </>
      )}

      <Button
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: blueColor,
          backgroundColor: "transparent",
          border: "none",
          fontSize: "1.2rem",
          textTransform: "none",
        }}
      >
        X
      </Button>
    </Paper>
  );
}

export default Sidebar;