import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import NodeBlock from "./NodeBlock";
import CircularScoreBar from "./CircularBar";
import { Box, Paper, Typography, Button, keyframes } from "@mui/material";
import { OrbitProgress } from "react-loading-indicators";
import CloseIcon from '@mui/icons-material/Close';

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

// Create a SidebarPortal component to ensure the sidebar renders at the document level
function SidebarPortal({ children }) {
  // Use ReactDOM.createPortal to render directly to body
  return ReactDOM.createPortal(
    children,
    document.body
  );
}

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

  useEffect(() => {
    console.log("Sidebar rendered with isOpen:", isOpen);
    console.log("Sidebar received nodeStatusList update:", nodeStatusList);
    console.log("NodeStatusList length:", nodeStatusList.length);

    if (nodeStatusList.length > 0) {
      console.log("Latest node update:", nodeStatusList[nodeStatusList.length - 1]);
    }
  }, [nodeStatusList, isOpen]);

  const nodeDisplayOrder = [
    { id: "CategorizePromptNode", label: "Prompt Categorization" },
    { id: "RephraseNode", label: "Prompt Rephrasing" },
    { id: "PromptEnhancerNode", label: "Prompt Enhancement" },
    { id: "PromptEvaluationNode", label: "Prompt Evaluation" },
  ];

  const getSimpleNodeName = (nodeName) => {
    if (!nodeName) return "Unknown Node";

    const displayNames = {
      "CategorizePromptNode": "📦 Prompt Categorized",
      "RephraseNode": "📝 Prompt Rephrased",
      "PromptEnhancerNode": "🧠 Enhanced Prompt Generated",
      "PromptEvaluationNode": "✅ Optimization Complete!"
    };

    return displayNames[nodeName] || "Node Processed";
  };

  const renderNodeOutput = (node) => {
    // If node has change_text from backend, use that
    if (node.change_text) {
      return (
        <Typography variant="body2">
          {node.change_text}
        </Typography>
      );
    }

    const output = node.node_output;

    if (typeof output === 'string') {
      return (
        <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
          {output.length > 100 ? `${output.substring(0, 100)}...` : output}
        </Typography>
      );
    }

    if (!output) {
      return null;
    }

    // For different node types (fallback if change_text not available)
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
              Score: {output.overall_score}
            </Typography>
          );
        }
        return null;

      default:
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

  // Use SidebarPortal to ensure the sidebar renders at the document level
  return (
    <SidebarPortal>
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
          zIndex: 9999,
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
          overflowY: "auto",
          borderRadius: "15px 0 0 15px", // Rounded only on left side
          border: `4px solid ${blueColor}`,
          borderRight: "none", // No border on right side
        }}
      >
        {isLoading && (
          <Box sx={{ marginTop: "50px", textAlign: "center" }}>
            <OrbitProgress color="#007DE0" size="medium" text="" textColor="" />
            <Typography
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
          </Box>
        )}

        {isLoading && (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            {nodeStatusList.length > 0 && nodeStatusList.map((node, index) => (
              <Paper
                key={`node-update-${index}-${node.time || Date.now()}`}
                sx={{
                  backgroundColor: "white",
                  color: "#007DE0",
                  p: 1,
                  borderRadius: "8px",
                  textAlign: "left",
                  width: "100%",
                  border: "3px solid #007DE0",
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
        {!isLoading && score !== null && <Box
          sx={{
            background: "#E3F2FD",
            color: "#1976D2",
            padding: "2px 8px",
            borderRadius: "15px",
            fontSize: "0.7rem",
            fontWeight: "500px",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
          }}
        >
          INITIAL PROMPT SCORE
        </Box>}

        {!isLoading && score !== null && (
          <>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                borderRadius: "12px",
                width: "100%",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
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
                p: 2,
                borderRadius: "12px",
                width: "100%",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                  Tips for Improvement:
                </Typography>
                <Box>
                  {improvementTips
                    ? improvementTips.split("\n").map((line, index) => (
                      <Typography key={index} variant="body2" sx={{ color: "#5f6368" }}>
                        {line}
                      </Typography>
                    ))
                    : <Typography>No suggestions available.</Typography>}
                </Box>
              </Box>
            </Paper>

            <Box
              sx={{
                width: "100%",
                p: 2,
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
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
          <CloseIcon />
        </Button>
      </Paper>
    </SidebarPortal>
  );
}

export default Sidebar;