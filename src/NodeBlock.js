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
      // case "OriginalPromptNode":
      //   if (data.original_prompt_answer) {
      //     changeText = `Initial response generated for the original prompt`;
      //     reasonText = `Response confidence: ${(data.original_prompt_lin_probs * 100).toFixed(2)}%`;
      //   }
      //   break;

      case "CategorizePromptNode":
        if (data.category) {
          changeText = `Prompt categorized as: ${data.category}`;
          reasonText = `Category determines the enhancement approach`;
        }
        break;

      case "QueryDisambiguationNode":
        if (data.clarification_question) {
          if (data.clarification_question === "clear") {
            changeText = `Prompt is clear and unambiguous`;
            reasonText = `No clarification needed`;
          } else {
            changeText = `Clarification needed: "${data.clarification_question}"`;
            reasonText = `Ambiguity detected in the original prompt`;
          }
        }
        break;

      case "RephraseNode":
        if (data.rephrased_question) {
          changeText = `Prompt rephrased for better AI understanding`;
          reasonText = `Improved clarity and structure`;
        }
        break;

      case "PromptEnhancerNode":
        if (data.enhanced_prompt) {
          changeText = `Prompt enhanced with best practices`;
          reasonText = `Added structure, clarity, and precise instructions`;
        }
        break;

      case "PromptEvaluationNode":
        if (data.overall_score) {
          changeText = `Prompt evaluation score: ${(data.overall_score * 10).toFixed(0)}/100`;
          reasonText = data.scores ?
            `Scores: ${Object.entries(data.scores)
              .map(([dim, score]) => `${dim}: ${score}/10`)
              .join(', ')}` :
            `Evaluation complete`;
        }
        break;

      case "FinalAnswerNode":
        if (data.final_prompt_answer) {
          changeText = `Final response generated`;
          reasonText = `Response confidence: ${(data.final_prompt_lin_probs * 100).toFixed(2)}%`;
        }
        break;

      default:
        if (data.current_step) {
          changeText = `Processing step: ${data.current_step}`;
          reasonText = `Node processing completed`;
        } else {
          changeText = `Processing ${nodeLabel || nodeName}`;
          reasonText = `Node status: ${data.status || "completed"}`;
        }
    }

    return { changeText, reasonText };
  };

  // useEffect to handle direct node data from WebSocket
  useEffect(() => {
    // Check if fetchNodeData is a function (old way) or direct data (new WebSocket way)
    if (typeof fetchNodeData === 'function') {
      // Old way - fetch asynchronously
      fetchNodeData(nodeName)
        .then((data) => {
          setNodeData(data);
          const { changeText, reasonText } = extractNodeData(data);
          setChangeText(changeText || data.changeText);
          setReasonText(reasonText || data.reasonText);
        })
        .catch((error) => {
          console.error(`Error fetching data for ${nodeName}:`, error);
        });
    } else {
      // New way - direct data object from WebSocket
      const data = fetchNodeData;
      setNodeData(data);
      const { changeText, reasonText } = extractNodeData(data);
      setChangeText(changeText);
      setReasonText(reasonText);
    }
  }, [fetchNodeData, nodeName, nodeLabel]);

  const handleToggle = () => {
    // Only toggle if the data is ready (both changeText and reasonText exist or nodeData exists)
    if ((changeText && reasonText) || nodeData) {
      setIsExpanded((prev) => !prev);
    }
  };

  // Determine if we have valid data to display
  const hasData = (changeText && reasonText) || nodeData !== null;

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
        </Box>
      )}
    </Paper>
  );
}

export default NodeBlock;