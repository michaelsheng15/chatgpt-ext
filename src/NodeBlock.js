import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";

function NodeBlock({ nodeName, fetchNodeData }) {

  const [isExpanded, setIsExpanded] = useState(false);
  const [changeText, setChangeText] = useState(null);
  const [reasonText, setReasonText] = useState(null);

  // useEffect to fetch data when the component mounts or when nodeName changes
  useEffect(() => {
    if (!fetchNodeData) {
      console.error(`fetchNodeData is undefined for ${nodeName}`);
      return;
    }
    fetchNodeData(nodeName)
      .then((data) => {
        setChangeText(data.changeText);
        setReasonText(data.reasonText);
      })
      .catch((error) => {
        console.error(`Error fetching data for ${nodeName}:`, error);
      });
  }, [fetchNodeData, nodeName]);

  const handleToggle = () => {
    // Only toggle if the data is ready (both changeText and reasonText exist).
    if (!changeText || !reasonText) return;
    setIsExpanded((prev) => !prev);
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
        backgroundColor: changeText && reasonText ? "white" : "grey.300",
        cursor: changeText && reasonText ? "pointer" : "not-allowed",
        opacity: changeText && reasonText ? 1 : 0.5,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {nodeName}
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
