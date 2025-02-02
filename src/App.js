// App.js - Manages the floating button, sidebar, and api call when the button is clicked.

import React, { useState, useEffect } from "react";
import IslandButton from "./IslandButton";
import Sidebar from "./Sidebar";
import { scrape, injectEnhancedPrompt } from "./utils";

function App() {
    const [alwaysShowInsights, setAlwaysShowInsights] = useState(true);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [originalPrompt, setOriginalPrompt] = useState("");
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        window.addEventListener("message", (event) => {
            if (event.data?.type === "SETTINGS_UPDATE") {
                setAlwaysShowInsights(event.data.alwaysShowInsights);
            }
        });
    }, []);

    const sendToEngine = async () => {
        try {
            console.log("Button clicked");
            const prompt = scrape();
            if (!prompt) {
                console.log("No input found");
                return;
            }

            setOriginalPrompt(prompt);
            console.log("setting original prompt to " + prompt);

            // Make sure window.callEnhancerAPI exists
            if (typeof window.callEnhancerAPI !== 'function') {
                throw new Error('Enhancer API not initialized');
            }

            // const data = {
            //     enhancedPrompt: "This is a hardcoded enhanced prompt.",
            //     answer: "This is a hardcoded answer."
            // };

            const data = await window.callEnhancerAPI(prompt);

            console.log(data);

            setAnswer(data.answer);
            injectEnhancedPrompt(data.enhancedPrompt);
        } catch (error) {
            console.error('Error in sendToEngine:', error);
            // Handle error appropriately in your UI
        }
    };

    return (
        <div>
            <IslandButton
                alwaysShowInsights={alwaysShowInsights}
                isSidebarVisible={isSidebarVisible}
                setIsSidebarVisible={setIsSidebarVisible}
                sendToEngine={sendToEngine}
            />
            <Sidebar
                isOpen={isSidebarVisible}
                onClose={() => setIsSidebarVisible(false)}
                originalPrompt={originalPrompt}
                answer={answer}
            />
        </div>
    );
}

export default App;
