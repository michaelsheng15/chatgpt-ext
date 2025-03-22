import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";

function NodeBlock({ nodeName, nodeLabel, fetchNodeData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [changeText, setChangeText] = useState(null);
  const [nodeData, setNodeData] = useState(null);

  // useEffect to fetch node data
  useEffect(() => {
    const getNodeData = async () => {
      try {
        const data = await fetchNodeData(nodeName);
        setNodeData(data);

        if (data) {
          // Use the change_text from backend if available or generate a fallback
          const backendChangeText = data.change_text || generateFallbackChangeText(nodeName, data);
          setChangeText(backendChangeText);
        }
      } catch (error) {
        console.error(`Error fetching data for ${nodeName}:`, error);
      }
    };

    getNodeData();
  }, [fetchNodeData, nodeName, nodeLabel]);

  // Generate fallback change text if backend doesn't provide it
  const generateFallbackChangeText = (nodeName, data) => {
    switch (nodeName) {
      case "CategorizePromptNode":
        return data ? `Prompt categorized as: ${data}` : null;
      case "RephraseNode":
        return data ? "Prompt rephrased for better AI understanding" : null;
      case "PromptEnhancerNode":
        return data ? "Prompt enhanced with best practices" : null;
      case "PromptEvaluationNode":
        return data && data.overall_score ?
          `Prompt evaluation score: ${(data.overall_score * 10).toFixed(0)}/100` :
          data && data.score ?
            `Prompt evaluation score: ${data.score}/100` :
            null;
      default:
        return data ? `Processing ${nodeLabel || nodeName}` : null;
    }
  };

  const handleToggle = () => {
    // Only toggle if the data is ready
    if (changeText || nodeData !== null) {
      setIsExpanded((prev) => !prev);
    }
  };

  // Determine if we have valid data to display
  const hasData = changeText || nodeData !== null;

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
                ? nodeData
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
            {changeText}
          </Typography>

          {/* Additional node-specific content */}
          {renderNodeContent()}
        </Box>
      )}
    </Paper>
  );
}

export default NodeBlock;