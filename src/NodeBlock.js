import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";

function NodeBlock({ nodeName, nodeLabel, fetchNodeData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [changeText, setChangeText] = useState(null);
  const [reasonText, setReasonText] = useState(null);
  const [nodeData, setNodeData] = useState(null);

  // Function to extract node-specific data and format it
  const extractNodeData = (data) => {
    if (!data) return { changeText: null, reasonText: null };

    let changeText = "";
    let reasonText = "";

    // Handle different node types with different data structures
    switch (nodeName) {
      case "CategorizePromptNode":
        // For category, data is a string directly
        if (data) {
          changeText = `Prompt categorized as: ${data}`;
          reasonText = `Category determines the enhancement approach`;
        }
        break;

      case "RephraseNode":
        // For rephrase, data is a string with the rephrased question
        if (data) {
          changeText = `Prompt rephrased for better AI understanding`;
          reasonText = `Improved clarity and structure`;
        }
        break;

      case "PromptEnhancerNode":
        // For enhancer, data is the enhanced prompt as a string
        if (data) {
          changeText = `Prompt enhanced with best practices`;
          reasonText = `Added structure, clarity, and precise instructions`;
        }
        break;

      case "PromptEvaluationNode":
        // For evaluation, data is an object with scores and suggestions
        if (data && data.overall_score) {
          changeText = `Prompt evaluation score: ${(data.overall_score * 10).toFixed(0)}/100`;
          reasonText = data.scores ?
            `Scores: ${Object.entries(data.scores)
              .map(([dim, score]) => `${dim}: ${score}/10`)
              .join(', ')}` :
            `Evaluation complete`;
        }
        break;

      default:
        // Default handler for any other node types
        if (typeof data === 'string') {
          changeText = `Processing ${nodeLabel || nodeName}`;
          reasonText = data;
        } else if (data) {
          changeText = `Processing ${nodeLabel || nodeName}`;
          reasonText = `Node processing completed`;
        }
    }

    return { changeText, reasonText };
  };

  // useEffect to fetch node data
  useEffect(() => {
    const getNodeData = async () => {
      try {
        const data = await fetchNodeData(nodeName);
        setNodeData(data);

        if (data) {
          const { changeText, reasonText } = extractNodeData(data);
          setChangeText(changeText);
          setReasonText(reasonText);
        }
      } catch (error) {
        console.error(`Error fetching data for ${nodeName}:`, error);
      }
    };

    getNodeData();
  }, [fetchNodeData, nodeName, nodeLabel]);

  const handleToggle = () => {
    // Only toggle if the data is ready (both changeText and reasonText exist or nodeData exists)
    if ((changeText && reasonText) || nodeData !== null) {
      setIsExpanded((prev) => !prev);
    }
  };

  // Determine if we have valid data to display
  const hasData = (changeText && reasonText) || nodeData !== null;

  // Function to render additional node-specific content
  const renderNodeContent = () => {
    if (!nodeData) return null;

    switch (nodeName) {
      case "RephraseNode":
        return (
          <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {typeof nodeData === 'string' ? nodeData : JSON.stringify(nodeData)}
            </Typography>
          </Box>
        );

      case "PromptEnhancerNode":
        return (
          <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
              {typeof nodeData === 'string'
                ? (nodeData.length > 150 ? `${nodeData.substring(0, 150)}...` : nodeData)
                : JSON.stringify(nodeData)}
            </Typography>
          </Box>
        );

      case "PromptEvaluationNode":
        if (nodeData.suggestions && nodeData.suggestions.length > 0) {
          return (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">Suggestions:</Typography>
              {nodeData.suggestions.slice(0, 3).map((suggestion, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                  • {suggestion}
                </Typography>
              ))}
            </Box>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <Paper
      variant="outlined"
      onClick={handleToggle} // Toggle details when the Paper is clicked.
      sx={{
        width: "100%",
        p: 1,
        mb: 1,
        // conditional based on if data is available
        backgroundColor: hasData ? "white" : "grey.300",
        cursor: hasData ? "pointer" : "not-allowed",
        opacity: hasData ? 1 : 0.5,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {nodeLabel || nodeName}
        </Typography>
        <Typography variant="subtitle1">
          {isExpanded ? "▼" : "▶"}
        </Typography>
      </Box>
      {isExpanded && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            <strong>What Changed:</strong> {changeText}
          </Typography>
          <Typography variant="body2">
            <strong>Why:</strong> {reasonText}
          </Typography>

          {/* Additional node-specific content */}
          {renderNodeContent()}
        </Box>
      )}
    </Paper>
  );
}

export default NodeBlock;