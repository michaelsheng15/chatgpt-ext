// This script captures the typed text in the ChatGPT input box and stores it in Chrome storage.

console.log("Content script loaded.");

// Find the ChatGPT input element (based off of Jackson's code)
const inputBox = document.querySelector('.ProseMirror');

if (inputBox) {
  inputBox.addEventListener('input', (event) => {
    const typedText = inputBox.innerText;
    console.log('Text captured:', typedText);

    // Store the typed text in Chrome storage
    chrome.storage.local.set({ typedText: typedText }, () => {
      console.log("Text saved:", typedText);
    });
  });
} else {
  console.warn("Input field not found.");
}
