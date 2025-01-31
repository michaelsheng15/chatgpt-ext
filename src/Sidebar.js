// Sidebar.js - Slides in and out, includes a close button, displays the information

import React from "react";

function Sidebar({ isOpen, onClose, originalPrompt, answer }) {
    return (
        <div
            style={{
                position: "fixed",
                top: "0",
                right: isOpen ? "0" : "-300px",
                width: "300px",
                height: "100%",
                background: "#d3d3d3",
                color: "#000",
                boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease-in-out",
                transform: isOpen ? "translateX(0)" : "translateX(100%)",
                zIndex: "999",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <h2>Sidebar</h2>
            <div>
                <h3>Original Prompt</h3>
                <p style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {originalPrompt || "No prompt available."}
                </p>
            </div>
            <div>
                <h3>Enhanced Response</h3>
                <p style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {answer || "No response available."}
                </p>
            </div>
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    padding: "5px 10px",
                    fontSize: "1.2rem",
                    backgroundColor: "transparent",
                    color: "#000",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                X
            </button>
        </div>
    );
}

export default Sidebar;
