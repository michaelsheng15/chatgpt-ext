import React, { useEffect } from "react";
import NodeBlock from "./NodeBlock";
import CircularScoreBar from "./CircularBar";
import { Box, Paper, Typography, Button, keyframes } from "@mui/material";
import { OrbitProgress } from "react-loading-indicators";


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
  const blueColor = "#007DE0";

  // Enhanced logging when node status list changes
  useEffect(() => {
    console.log("Sidebar received nodeStatusList update:", nodeStatusList);
    console.log("NodeStatusList length:", nodeStatusList.length);

    if (nodeStatusList.length > 0) {
      console.log("Latest node update:", nodeStatusList[nodeStatusList.length - 1]);
    }
  }, [nodeStatusList]);


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
      "CategorizePromptNode": "📦 Prompt Categorized",
      "RephraseNode": "📝 Prompt Rephrased",
      "PromptEnhancerNode": "🧠 Enhanced Prompt Generated",
      "PromptEvaluationNode": "✅ Optimization Complete!"
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
        <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
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
            Rephrased: {typeof output === 'string' && output.length > 50 ? `${output.substring(0, 50)}...` : output}
          </Typography>
        );

      case "PromptEnhancerNode":
        return (
          <Typography variant="body2">
            Enhanced prompt: {typeof output === 'string' ? `(${output.length} chars)` : ''}
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
        borderRadius: "15px"
      }}
    >

      {isLoading && (
        <Box sx={{ marginTop: "50px", textAlign: "center" }}>
          <OrbitProgress color="#007DE0" size="medium" text="" textColor="" />
          <Typography
            // variant="h4"
            sx={{
              marginTop: "30px",
              fontSize: "22px",
              fontWeight: "bold",
              color: "black",
              letterSpacing: "0em"
            }}
          >
            Optimizing your prompt!
          </Typography>

          <Typography
            sx={{
              color: "grey",
              marginTop: "8px",
              marginBottom: "8px",
              fontSize: "15px"
            }}
          >
            Enhancing prompt structure and analyzing context...
          </Typography>
        </Box>)}

      {isLoading && (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {nodeStatusList.length > 0 && nodeStatusList.map((node, index) => (
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
              <Typography variant="body2" fontWeight="bold" fontSize="15px">
                {getSimpleNodeName(node.node_type || node.node_name)}
              </Typography>
              {renderNodeOutput(node)}
            </Paper>
          ))}
        </Box>
      )}

      {!isLoading && <CircularScoreBar score={score} />}

      {!isLoading && (
        <>
          <Paper
            elevation={4}
            sx={{
              p: 2, // Increased padding for better spacing
              borderRadius: "12px", // Rounded corners
              width: "100%",
              backgroundColor: "#fff", // White background
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Darker and larger shadow
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Score Breakdown:
              </Typography>
              <Typography variant="body2" sx={{ color: "#5f6368" }}>
                {scoreRationale || "No explanation available."}
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={4}
            sx={{
              p: 2, // Increased padding for better spacing
              borderRadius: "12px", // Rounded corners
              width: "100%",
              backgroundColor: "#fff", // White background
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Darker and larger shadow
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Tips for Improvement:
              </Typography>
              <Typography variant="body2" sx={{ color: "#5f6368" }}>
                {improvementTips || "No suggestions available."}
              </Typography>
            </Box>
          </Paper>

          <Box
            sx={{
              width: "100%",
              p: 2, // Padding for better spacing
              borderRadius: "12px", // Rounded corners
              backgroundColor: "#fff", // White background
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Darker, larger shadow
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem", mb: 1 }}>
              What Changed?
            </Typography>

            {nodeDisplayOrder.map((node) => (
              <NodeBlock
                key={`node-${node.id}-${optimizationRun}`}
                nodeName={node.id}
                nodeLabel={node.label}
                fetchNodeData={fetchNodeData}
              />
            ))}
          </Box>
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