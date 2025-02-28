import React from "react";
import { Box, Button, ButtonGroup } from "@mui/material";

function IslandButton({
  alwaysShowInsights,
  isSidebarVisible,
  runOptimization,
  showInsights,
  closeSidebar,
  restoreOriginal,
  score,
  isLoading,
}) {
  const blueColor = "#2196f3";

  const getScoreColor = (score) => {
    if (score >= 75) return "green";
    if (score >= 40) return "orange";
    return "red";
  };

  const containerStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    transition: "transform 0.3s ease-in-out",
    transform: isSidebarVisible ? "translateX(-300px)" : "translateX(0)",
    zIndex: 10000,
  };

  if (isSidebarVisible) {
    if (isLoading) {
      // While loading, show close sidebar
      return (
        <Box sx={containerStyle}>
          <Button
            onClick={closeSidebar}
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: blueColor }}
          >
            Close Sidebar
          </Button>
        </Box>
      );
    } else {
      // Once loading is done, show both red X and Close Sidebar
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium">
            <Button onClick={restoreOriginal} color="error" sx={{ textTransform: "none" }}>
              X
            </Button>
            <Button onClick={closeSidebar} sx={{ textTransform: "none", backgroundColor: blueColor }}>
              Close Sidebar
            </Button>
          </ButtonGroup>
        </Box>
      );
    }
  }

  // Sidebar closed for following
  if (alwaysShowInsights) {
    // Toggle ON: normal behavior
    if (score !== null) {
      // Score available: show three segments Red X, Optimize, Score
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium">
            <Button onClick={restoreOriginal} color="error" sx={{ textTransform: "none" }}>
              X
            </Button>
            <Button onClick={runOptimization} sx={{ textTransform: "none", backgroundColor: blueColor }}>
              Optimize
            </Button>
            <Button
              onClick={showInsights}
              sx={{ textTransform: "none", backgroundColor: getScoreColor(score) }}
            >
              {score}
            </Button>
          </ButtonGroup>
        </Box>
      );
    } else {
      // No score yet (kind of like initial state, or after a clear)
      return (
        <Box sx={containerStyle}>
          <Button
            onClick={runOptimization}
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: blueColor }}
            disabled={isLoading}
          >
            {isLoading ? "Optimizing..." : "Optimize"}
          </Button>
        </Box>
      );
    }
  } else {
    // Toggle OFF
    if (isLoading) {
      // While loading
      return (
        <Box sx={containerStyle}>
          <Button variant="contained" disabled sx={{ textTransform: "none", backgroundColor: blueColor }}>
            Loading...
          </Button>
        </Box>
      );
    } else if (score !== null) {
      // Once loading is finished and a score is available: show three segments [Red X, Optimize, Score].
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium">
            <Button onClick={restoreOriginal} color="error" sx={{ textTransform: "none" }}>
              X
            </Button>
            <Button onClick={runOptimization} sx={{ textTransform: "none", backgroundColor: blueColor }}>
              Optimize
            </Button>
            <Button
              onClick={showInsights}
              sx={{ textTransform: "none", backgroundColor: getScoreColor(score) }}
            >
              {score}
            </Button>
          </ButtonGroup>
        </Box>
      );
    } else {
      // No loading and no score, waiting for input: 
      return (
        <Box sx={containerStyle}>
          <Button
            onClick={runOptimization}
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: blueColor }}
          >
            Optimize
          </Button>
        </Box>
      );
    }
  }
}

export default IslandButton;
