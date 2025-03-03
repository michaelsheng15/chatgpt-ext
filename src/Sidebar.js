import React, { useState, useEffect } from "react";
import NodeBlock from "./NodeBlock";
// import ScoreBar from "./ScoreBar";
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
  isLoading, // Now using global isLoading from App.js
}) {
  const blueColor = "#007DE0";
  const [visibleBlocks, setVisibleBlocks] = useState([false, false, false]);

  useEffect(() => {
    if (isOpen && isLoading) {
      // Adjusted timings: Blocks appear at 1s, 3s, and 5s instead of 0s, 1.5s, and 3s
      const timers = [
        setTimeout(() => setVisibleBlocks([true, false, false]), 1000), // First block appears after 1s
        setTimeout(() => setVisibleBlocks([true, true, false]), 3000), // Second block appears after 3s
        setTimeout(() => setVisibleBlocks([true, true, true]), 5000), // Third block appears after 5s
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleBlocks([false, false, false]); // Reset blocks when closing
    }
  }, [isOpen, isLoading]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        borderRadius: "25px",
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
              fontSize: "15px"
            }}
          >
            Enhancing prompt structure and analyzing context...
          </Typography>
        </Box>)}


      {!isLoading && <CircularScoreBar score={score} />}
      {!isLoading && <Box
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
        PROMPT SCORE
      </Box>}



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
          <Paper
            elevation={2}
            sx={{
              p: 2, // Increased padding for better spacing
              borderRadius: "12px", // Rounded corners
              width: "100%",
              backgroundColor: "#fff", // White background
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for a modern look
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Why this score?
              </Typography>
              <Typography variant="body2" sx={{ color: "#5f6368" }}>
                {scoreRationale || "No explanation available."}
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 2, // Increased padding for better spacing
              borderRadius: "12px", // Rounded corners
              width: "100%",
              backgroundColor: "#fff", // White background
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for a modern look
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Tips for Improvement
              </Typography>
              <Typography variant="body2" sx={{ color: "#5f6368" }}>
                {improvementTips || "No suggestions available."}
              </Typography>
            </Box>
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