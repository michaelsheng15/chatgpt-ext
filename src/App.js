// This is the main React component. It sends a message to the background script to get the typed text from storage.

import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    console.log("Requesting typedText...");

    chrome.runtime.sendMessage(
      { action: "getTypedText" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error receiving typedText:", chrome.runtime.lastError);
        } else {
          console.log("Received typedText:", response);
          setTypedText(response);
        }
      }
    );
  }, [typedText]);

  return (
    <div className="App">
      <h1>Typed Text from ChatGPT:</h1>
      <label>{typedText}</label>
    </div>
  );
}

export default App;
