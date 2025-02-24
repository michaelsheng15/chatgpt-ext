// IslandButton.js - island button that handles all user input.

import React, { useState } from "react";

function IslandButton({ alwaysShowInsights, isSidebarVisible, setIsSidebarVisible, sendToEngine }) {
    const [buttonText, setButtonText] = useState("Optimize");

    const handleClick = () => {
        if (isSidebarVisible) {
            setIsSidebarVisible(false);
            setButtonText("Optimize");
        } else {
            if (alwaysShowInsights) {
                setIsSidebarVisible(true);
                sendToEngine();
            } else {
                if (buttonText === "Optimize") {
                    sendToEngine();
                    setButtonText("Show Insights");
                } else {
                    setIsSidebarVisible(true);
                }
            }
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: isSidebarVisible ? "320px" : "20px",
                transition: "right 0.3s ease-in-out",
                zIndex: "10000",
            }}
        >
            <button
                style={{
                    padding: "10px",
                    backgroundColor: "#007DE0",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease-in-out",
                }}
                onClick={handleClick}
            >
                {isSidebarVisible ? "Close Sidebar" : buttonText}
            </button>
        </div>
    );
}

export default IslandButton;
