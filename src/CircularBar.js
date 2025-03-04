import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { useEffect, useState } from "react";

const CircularScoreBar = ({ score, maxScore = 100, animationDuration = 1000 }) => {
  const [progress, setProgress] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  // Circular size and thickness
  const size = 220;
  const thickness = 10; // Thicker for a bolder effect
  const fontSize = "3rem"; // Bigger font for the score

  useEffect(() => {
    let start = 0;
    const step = (score / maxScore) * 100 / (animationDuration / 10);

    const interval = setInterval(() => {
      start += step;
      if (start >= (score / maxScore) * 100) {
        setProgress((score / maxScore) * 100);
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setProgress(start);
        setDisplayScore(Math.round((start / 100) * maxScore));
      }
    }, 10);

    return () => clearInterval(interval);
  }, [score, maxScore, animationDuration]);

  return (
    <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* White Background Circle with Shadow */}
      <Paper
        elevation={5}
        sx={{
          width: size - 60,
          height: size - 60,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          zIndex: 2,
          background: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: fontSize }}>
            {displayScore}
          </Typography>
          <Typography variant="body2" sx={{ color: "#888", fontSize: "0.9rem" }}>
            /{maxScore}
          </Typography>
        </Box>
      </Paper>

      {/* Background Circle */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: "#E0E0E0", position: "absolute" }}
      />

      {/* Animated Foreground Circle (Flat Edges) */}
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        thickness={thickness}
        sx={{
          color: "transparent",
          "& .MuiCircularProgress-circle": {
            stroke: "url(#gradient)", // Apply gradient
          },
        }}
      />

      {/* Gradient Definition */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#673AB7" />  {/* Purple */}
            <stop offset="100%" stopColor="#2196F3" /> {/* Blue */}
          </linearGradient>
        </defs>
      </svg>      
    </Box>
  );
};

export default CircularScoreBar;