import React from "react";
import NodeBlock from "./NodeBlock";
import { Box, Paper, Typography, Button } from "@mui/material";

function Sidebar({
  isOpen,
  onClose,
  score,
  scoreRationale,
  improvementTips,
  fetchNodeData,
  optimizationRun,
  isLoading, 
}) {
  const blueColor = "#2196f3";

  const getScoreColor = (score) => {
    if (score >= 75) return "green";
    if (score >= 40) return "orange";
    return "red";
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
        boxShadow: " -2px 0 5px rgba(0, 0, 0, 0.2)",
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

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: isLoading ? blueColor : getScoreColor(score),
        }}
      >
        Score: {isLoading ? "Loading..." : (score ?? "--")}
      </Typography>

      <Paper variant="outlined" sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd" }}>
        <Typography variant="h6">Why this score?</Typography>
        <Typography variant="body2">
          {scoreRationale || "No explanation available."}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1, width: "100%", backgroundColor: "#e3f2fd" }}>
        <Typography variant="h6">Improvement tips</Typography>
        <Typography variant="body2">
          {improvementTips || "No suggestions available."}
        </Typography>
      </Paper>

      <Box sx={{ width: "100%" }}>
        <Typography variant="h6">Changes Made</Typography>
        {Array.from({ length: 7 }, (_, index) => (
          <NodeBlock
            key={`node-${index}-${optimizationRun}`}
            nodeName={`Node ${index + 1}`}
            fetchNodeData={fetchNodeData}
          />
        ))}
      </Box>

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
