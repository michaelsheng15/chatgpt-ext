import React from "react";
import { Box, Button, ButtonGroup } from "@mui/material";
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
  const redColor = "red"

  const containerStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    transition: "transform 0.3s ease-in-out",
    transform: isSidebarVisible ? "translateX(-300px)" : "translateX(0)",
    zIndex: 10000,
  };

  const buttonGroupStyle = {
    backgroundColor: whiteColor,
    border: `4px solid ${blueColor}`,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Deeper shadow
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
            <Button onClick={closeSidebar} sx={{ backgroundColor: whiteColor, borderRadius: "20px" }}>
              <AnalyticsIcon sx={{ color: blueColor }}/>  
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
            <Button onClick={runOptimization} sx={{ backgroundColor: whiteColor, borderRadius: "20px" }}>
              <AutoModeIcon sx={{ color: blueColor }} />
            </Button>
            <Button onClick={showInsights} sx={{ backgroundColor: whiteColor, borderRadius: "0 20px 20px 0" }}>
              <KeyboardDoubleArrowLeftIcon sx={{ color: blueColor }} />
              <AnalyticsIcon sx={{ color: blueColor }}/>
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
            <AutoFixHighIcon sx={{ color: blueColor }} />
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
            <Button onClick={runOptimization} sx={{ backgroundColor: whiteColor, borderRadius: "20px" }}>
              <AutoModeIcon sx={{ color: blueColor }} />
            </Button>
            <Button onClick={showInsights} sx={{ backgroundColor: whiteColor, borderRadius: "0 20px 20px 0" }}>
              <KeyboardDoubleArrowLeftIcon sx={{ color: blueColor }} />
              <AnalyticsIcon sx={{ color: blueColor }}/>
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