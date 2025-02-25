import React, { useState, useEffect } from "react";
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
  isLoading, // Now using global isLoading from App.js
}) {
  const blueColor = "#2196f3";
  const [visibleBlocks, setVisibleBlocks] = useState([false, false, false]);

  useEffect(() => {
    if (isOpen && isLoading) {
      // Adjusted timings: Show blocks immediately, 1.5s, and 3s
      const timers = [
        setTimeout(() => setVisibleBlocks([true, false, false]), 0), // First block appears instantly
        setTimeout(() => setVisibleBlocks([true, true, false]), 1500), // Second block appears after 1.5s
        setTimeout(() => setVisibleBlocks([true, true, true]), 3000), // Third block appears after 3s
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleBlocks([false, false, false]); // Reset blocks when closing
    }
  }, [isOpen, isLoading]);

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
        {isLoading ? "Hold tight, we’re supercharging your prompts! ⚡️" : `Score: ${score ?? "--"}`}
      </Typography>

      {isLoading ? (
        // Loading Blocks with Optimized Timing
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {["Loading...", "Fetching data...", "Almost done..."].map((text, index) =>
            visibleBlocks[index] ? (
              <Paper
                key={index}
                sx={{
                  backgroundColor: "#007DE0",
                  color: "white",
                  p: 1,
                  borderRadius: "8px",
                  textAlign: "left",
                  width: "100%",
                  opacity: 0,
                  animation: `${slideUp} 0.8s forwards`, // Faster slide-up effect
                }}
              >
                {text}
              </Paper>
            ) : null
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
            {Array.from({ length: 7 }, (_, index) => (
              <NodeBlock
                key={`node-${index}-${optimizationRun}`}
                nodeName={`Node ${index + 1}`}
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