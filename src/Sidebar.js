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

    if (nodeStatusList.length > 0) {
      console.log("Latest node update:", nodeStatusList[nodeStatusList.length - 1]);
    }
  }, [nodeStatusList]);

  const getScoreColor = (val) => {
    if (val >= 75) return "green";
    if (val >= 40) return "orange";
    return "red";
  };

  // Define the order and names of nodes to display in the "Changes Made" section
  const nodeDisplayOrder = [
    { id: "CategorizePromptNode", label: "Prompt Categorization" },
    { id: "RephraseNode", label: "Prompt Rephrasing" },
    { id: "PromptEnhancerNode", label: "Prompt Enhancement" },
    { id: "PromptEvaluationNode", label: "Prompt Evaluation" },
  ];

  // Function to get a simplified node name for display
  const getSimpleNodeName = (nodeName) => {
    if (!nodeName) return "Unknown Node";

    const displayNames = {
      "CategorizePromptNode": "Prompt Categorized",
      "RephraseNode": "Prompt Rephrased",
      "PromptEnhancerNode": "Enhanced Prompt Generated",
      "PromptEvaluationNode": "Prompt Evaluation"
    }

    const displayName = displayNames[nodeName]

    return displayName;
  };

  // Helper to display node output based on type
  const renderNodeOutput = (node) => {
    const output = node.node_output;

    // If output is a string, show it directly
    if (typeof output === 'string') {
      return (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {output.length > 100 ? `${output.substring(0, 100)}...` : output}
        </Typography>
      );
    }

    // If output is null or undefined
    if (!output) {
      return null;
    }

    // For different node types
    switch (node.node_type || node.node_name) {
      case "CategorizePromptNode":
        return (
          <Typography variant="body2">
            Category: {output}
          </Typography>
        );

      case "RephraseNode":
        return (
          <Typography variant="body2">
            Rephrased to: {typeof output === 'string' && output.length > 50 ? `${output.substring(0, 50)}...` : output}
          </Typography>
        );

      case "PromptEnhancerNode":
        return (
          <Typography variant="body2">
            Enhanced prompt created {typeof output === 'string' ? `(${output.length} chars)` : ''}
          </Typography>
        );

      case "PromptEvaluationNode":
        if (output && output.overall_score) {
          return (
            <Typography variant="body2">
              Score: {(output.overall_score * 10).toFixed(0)}/100
            </Typography>
          );
        }
        return null;

      default:
        // For any other node or object output, show a summary
        if (output) {
          return (
            <Typography variant="body2">
              Process completed
            </Typography>
          );
        }
        return null;
    }
  };

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
      {/* Top Title: either "Hold tight..." or final score */}
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

      {/* Node updates (real-time or final) */}
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* If we have node updates, show them. Otherwise, show placeholders */}
        {nodeStatusList.length > 0 ? (
          nodeStatusList.map((node, index) => (
            <Paper
              key={`node-update-${index}-${node.time || Date.now()}`}
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
                {getSimpleNodeName(node.node_type || node.node_name)}
              </Typography>

              {/* Display the node output appropriately */}
              {renderNodeOutput(node)}
            </Paper>
          ))
        ) : (
          // Fallback placeholders if no updates yet
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
              <Typography variant="body2">{text}</Typography>
            </Paper>
          ))
        )}
      </Box>

      {/* Once the process is done (isLoading === false), show final summary/score details */}
      {!isLoading && (
        <>
          <Paper
            variant="outlined"
            sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd", mt: 2 }}
          >
            <Typography variant="h6">Why this score?</Typography>
            <Typography variant="body2">
              {scoreRationale || "No explanation available."}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd" }}
          >
            <Typography variant="h6">Improvement tips</Typography>
            <Typography variant="body2">
              {improvementTips || "No suggestions available."}
            </Typography>
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

          {/* Debug info - optional in final release */}
          <Paper
            variant="outlined"
            sx={{ p: 1, width: "100%", mt: 2, bgcolor: "#f5f5f5" }}
          >
            <Typography variant="subtitle2">Debug Info</Typography>
            <Typography variant="body2">
              Node updates: {nodeStatusList.length}
            </Typography>
            <Typography variant="body2">Score: {score}</Typography>
            <Typography variant="caption" sx={{ display: "block", whiteSpace: "pre-wrap" }}>
              Last update:{" "}
              {nodeStatusList.length > 0
                ? JSON.stringify(nodeStatusList[nodeStatusList.length - 1], null, 2)
                  .substring(0, 100) + "..."
                : "None"}
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