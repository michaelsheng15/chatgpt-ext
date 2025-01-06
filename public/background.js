// This script listens for messages from the app.js and handles fetching and storing the typed text in Chrome storage.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
  // Initialize typedText to empty
  chrome.storage.local.set({ typedText: '' }, () => {
    console.log("Initial typedText set.");
  });
});

// Listen for requests from the popup to get the typedText
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTypedText") {
    console.log("Received request to get typedText.");
    chrome.storage.local.get("typedText", (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving typedText:", chrome.runtime.lastError);
        sendResponse("");
      } else {
        console.log("typedText from storage:", data.typedText);
        sendResponse(data.typedText || "");
      }
    });
    return true;  // Keep the message channel open for async response
  }
});
