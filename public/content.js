console.log("Content script started and running.");

function findInputBoxWithRetry() {
  const inputBox = document.querySelector('.ProseMirror');

  if (inputBox) {
    console.log("Input box found:", inputBox);

    inputBox.addEventListener('input', () => {
      const typedText = inputBox.innerText || ""; 
      console.log("Captured input event. Typed text:", typedText);

      // Save the typed text to Chrome storage
      chrome.storage.local.set({ typedText }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving to storage:", chrome.runtime.lastError);
        } else {
          console.log("Successfully saved text:", typedText);
        }
      });

      updatePopupContent();
    });

    createFloatingPopup();
  } else {
    console.warn("Input box not found. Retrying...");
    setTimeout(findInputBoxWithRetry, 500); //in case page hasn't loaded yet
  }
}


function createFloatingPopup() {

  if (document.getElementById("chatgpt-typed-text-popup")) {
    console.log("Popup already exists.");
    return;
  }

  const popup = document.createElement("div");
  popup.id = "chatgpt-typed-text-popup";

  //Its ugly, but I could not figure out how to access the app.css when injecting, so its all here :(
  //bassically we add a div element to the page so that it stays permanently

  //chatgpt helped here a lot
  popup.style.position = "fixed";
  popup.style.top = "20px";             
  popup.style.right = "20px";              
  popup.style.width = "100%";
  popup.style.maxWidth = "400px";         
  popup.style.maxHeight = "600px";       
  popup.style.overflow = "hidden";        
  popup.style.padding = "20px";           
  popup.style.zIndex = "10000";           
  popup.style.background = "#1E1E6B";   
  popup.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";  
  popup.style.borderRadius = "12px";      
  popup.style.boxSizing = "border-box";

 
  const header = document.createElement("div");
  header.className = "App-header";
  header.style.backgroundColor = "#542C9C";  
  header.style.width = "100%";
  header.style.display = "flex";
  header.style.flexDirection = "column";
  header.style.alignItems = "center";
  header.style.justifyContent = "center";
  header.style.fontSize = "1.5rem";       
  header.style.color = "white";


  const body = document.createElement("div");
  body.className = "App-body";
  body.style.textAlign = "center";
  body.style.padding = "10px";  


  const h3 = document.createElement("h3");
  h3.innerHTML = "Scraped text:";       


  const typedTextDisplay = document.createElement("p");
  typedTextDisplay.id = "typed-text-display";
  typedTextDisplay.textContent = "Dewy is waiting...";
  typedTextDisplay.style.color = "#DD5B8A"; 
  typedTextDisplay.style.fontSize = "1.25rem";  
  typedTextDisplay.style.fontWeight = "500";    


  header.appendChild(h3);
  body.appendChild(typedTextDisplay);
  popup.appendChild(header);
  popup.appendChild(body);


  document.body.appendChild(popup);

  console.log("Floating popup added to the page.");
}


function updatePopupContent() {
  chrome.storage.local.get("typedText", (data) => {
    const typedText = data.typedText || "Dewy is waiting...";
    const display = document.getElementById("typed-text-display");
    if (display) {
      display.textContent = typedText; 
    }
  });
}

findInputBoxWithRetry();
