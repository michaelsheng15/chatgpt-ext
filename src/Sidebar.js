import React, { useState, useEffect } from "react";

function Sidebar({ isOpen, onClose, originalPrompt, answer }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 10000); // 10-second delay

            return () => clearTimeout(timer);
        } else {
            setIsLoading(true); // Reset when sidebar closes
        }
    }, [isOpen]);

    return (
        <div
            style={{
                position: "fixed",
                top: "0",
                right: isOpen ? "0" : "-300px",
                width: "300px",
                height: "100%",
                background: "white",
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
            {/* Dynamic title */}
            <h3>{isLoading ? "Hold tight, we’re supercharging your prompts! ⚡️" : "Sidebar"}</h3>

            {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="loading-block" style={{ animationDelay: "3s" }}>Loading...</div>
                    <div className="loading-block" style={{ animationDelay: "6s" }}>Fetching data...</div>
                    <div className="loading-block" style={{ animationDelay: "9s" }}>Almost done...</div>
                </div>
            ) : (
                <>
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
                </>
            )}

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

            {/* Keyframes for animation (added in a style tag) */}
            <style>
                {`
                .loading-block {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: slideUp 1s forwards;
                    background-color: #007DE0;
                    color: white;
                    padding: 10px;
                    border-radius: 8px;
                    text-align: left;
                    width: 100%;
                    margin: 0 auto;
                    font-size: 12px;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                `}
            </style>
        </div>
    );
}

export default Sidebar;