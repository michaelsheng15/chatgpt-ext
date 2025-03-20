import React from "react";
import { Box, Button, ButtonGroup, CircularProgress } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import AnalyticsIcon from '@mui/icons-material/Analytics';

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
  const blueColor = "#007DE0";
  const whiteColor = "#fff";
  const redColor = "red";

  // For debugging
  React.useEffect(() => {
    console.log("IslandButton rendered with isSidebarVisible:", isSidebarVisible);
  }, [isSidebarVisible]);

  // No position or transform properties - just let the button stay where it's placed in the ChatGPT interface
  const containerStyle = {
    zIndex: 10000,
    marginTop: "-2px"
  };

  const buttonGroupStyle = {
    backgroundColor: whiteColor,
    border: `4px solid ${blueColor}`,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
    borderRadius: "20px",
  };

  if (isSidebarVisible) {
    if (isLoading) {
      return (
        <Box sx={containerStyle}>
          <Button />
        </Box>
      );
    } else {
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium" sx={buttonGroupStyle}>
            <Button onClick={restoreOriginal} sx={{ backgroundColor: whiteColor, borderRadius: "20px 0 0 20px" }}>
              <DeleteForeverIcon sx={{ color: redColor }} />
            </Button>
            <Button onClick={closeSidebar} sx={{ backgroundColor: whiteColor, borderRadius: "0 20px 20px 0" }}>
              <AnalyticsIcon sx={{ color: blueColor }} />
              <KeyboardDoubleArrowRightIcon sx={{ color: blueColor }} />
            </Button>
          </ButtonGroup>
        </Box>
      );
    }
  }

  if (alwaysShowInsights) {
    if (score !== null) {
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium" sx={buttonGroupStyle}>
            <Button onClick={restoreOriginal} sx={{ backgroundColor: whiteColor, borderRadius: "20px 0 0 20px" }}>
              <DeleteForeverIcon sx={{ color: redColor }} />
            </Button>
            <Button onClick={runOptimization} sx={{ backgroundColor: whiteColor }}>
              <AutoModeIcon sx={{ color: blueColor }} />
            </Button>
            <Button onClick={showInsights} sx={{ backgroundColor: whiteColor, borderRadius: "0 20px 20px 0" }}>
              <KeyboardDoubleArrowLeftIcon sx={{ color: blueColor }} />
              <AnalyticsIcon sx={{ color: blueColor }} />
            </Button>
          </ButtonGroup>
        </Box>
      );
    } else {
      return (
        <Box sx={containerStyle}>
          <Button
            onClick={runOptimization}
            variant="contained"
            sx={{ backgroundColor: whiteColor, borderRadius: "20px", border: `2px solid ${blueColor}` }}
          >
            <AutoFixHighIcon sx={{ color: blueColor }} />
          </Button>
        </Box>
      );
    }
  } else {
    if (isLoading) {
      return (
        <Box sx={containerStyle}>
          <Button variant="contained" sx={{ backgroundColor: whiteColor, border: `2px solid ${blueColor}` }}>
            <CircularProgress size={24} sx={{ color: blueColor }} />
          </Button>
        </Box>
      );
    } else if (score !== null) {
      return (
        <Box sx={containerStyle}>
          <ButtonGroup variant="contained" size="medium" sx={buttonGroupStyle}>
            <Button onClick={restoreOriginal} sx={{ backgroundColor: whiteColor, borderRadius: "20px 0 0 20px" }}>
              <DeleteForeverIcon sx={{ color: redColor }} />
            </Button>
            <Button onClick={runOptimization} sx={{ backgroundColor: whiteColor }}>
              <AutoModeIcon sx={{ color: blueColor }} />
            </Button>
            <Button onClick={showInsights} sx={{ backgroundColor: whiteColor, borderRadius: "0 20px 20px 0" }}>
              <KeyboardDoubleArrowLeftIcon sx={{ color: blueColor }} />
              <AnalyticsIcon sx={{ color: blueColor }} />
            </Button>
          </ButtonGroup>
        </Box>
      );
    } else {
      return (
        <Box sx={containerStyle}>
          <Button
            onClick={runOptimization}
            variant="contained"
            sx={{ backgroundColor: whiteColor, borderRadius: "20px", border: `2px solid ${blueColor}` }}
          >
            <AutoFixHighIcon sx={{ color: blueColor }} />
          </Button>
        </Box>
      );
    }
  }
}

export default IslandButton;