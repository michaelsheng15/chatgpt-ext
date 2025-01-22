// const loadMarkedScript = () => {
//   return new Promise((resolve, reject) => {
//     if (window.marked) {
//       resolve(window.marked);
//       return;
//     }

//     // Load marked.js directly
//     const script = document.createElement('script');
//     script.src = chrome.runtime.getURL('lib/marked.js');

//     script.onload = () => {
//       if (window.marked) {
//         resolve(window.marked);
//       } else {
//         // Try to execute the content directly
//         chrome.runtime.getURL('lib/marked.js');
//         if (window.marked) {
//           resolve(window.marked);
//         } else {
//           reject(new Error('Failed to initialize marked library'));
//         }
//       }
//     };

//     script.onerror = (error) => {
//       reject(new Error('Error loading marked.js script: ' + error));
//     };

//     document.head.appendChild(script);
//   });
// };

// const script = document.createElement('script');
// script.src = chrome.runtime.getURL('lib/marked.js');
// console.log('Trying to load marked from:', script.src);

// const injectMarked = async () => {
//   try {
//     const marked = await loadMarkedScript();
//     console.log('Marked library loaded successfully');
//     return marked;
//   } catch (error) {
//     console.error('Failed to load marked library:', error);
//     throw error;
//   }
// };

// (async () => {
//   try {
//     await injectMarked();
//     findInputBoxWithRetry();
//   } catch (error) {
//     console.error('Failed to load marked library:', error);
//     findInputBoxWithRetry();
//   }
// })();
let originalPrompt = "";
const simpleMarkdown = {
  parse: (text) => {
    // Remove standalone dashes (---)
    text = text.replace(/^---\s*$/gm, '');

    // Replace headers
    text = text.replace(/^### (.*$)/gm, '<h3 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">$1</h1>');

    // Replace bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #DD5B8A; display: inline-block; margin-top: 0.5em;">$1</strong>');

    // Add extra spacing between sections (Role:, Desired Output:, etc.)
    text = text.replace(/(Role:|Desired Output:|Enhanced Prompt:|Answer:)/g, '<div style="margin-top: 1.5em; margin-bottom: 0.5em;"><span style="color: #DD5B8A;">$1</span></div>');

    // Replace paragraphs (but not right after section headers)
    text = text.split(/\n\n+/).map(para => {
      if (!para.match(/(Role:|Desired Output:|Enhanced Prompt:|Answer:)/)) {
        return `<p style="margin: 0.5em 0;">${para.trim()}</p>`;
      }
      return para;
    }).join('\n');

    // Replace single newlines with line breaks
    text = text.replace(/([^\n])\n([^\n])/g, '$1<br>$2');

    // Replace bullet points
    text = text.replace(/^- (.+)$/gm, '<ul style="margin: 0.5em 0; padding-left: 1.5em;"><li>$1</li></ul>');

    return `<div style="line-height: 1.6; color: white;">${text}</div>`;
  }
};

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
      if (originalPrompt == "") {
        console.log("original prompt " + originalPrompt);
        updatePopupContent();
      }
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
  popup.style.left = "20px";
  popup.style.width = "100%";
  popup.style.maxWidth = "400px";
  popup.style.maxHeight = "600px";
  popup.style.overflow = "auto";
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
  header.style.padding = "10px";
  header.style.borderRadius = "8px";
  header.style.marginBottom = "15px";

  const body = document.createElement("div");
  body.className = "App-body";
  body.style.textAlign = "left";
  body.style.padding = "10px";

  const h3 = document.createElement("h3");
  h3.innerHTML = "Dewey.ai Prompt Enhancer";
  h3.style.margin = "0";

  // Create sections with consistent styling
  const createSection = (title, id, isHidden = false, sectionId = null) => {
    const section = document.createElement("div");
    section.style.marginBottom = "15px";
    section.style.padding = "10px";
    section.style.backgroundColor = "rgba(84, 44, 156, 0.2)";
    section.style.borderRadius = "8px";
    if (isHidden) {
      section.style.display = 'none';
    }
    if (sectionId) {
      section.id = sectionId;
    }

    const label = document.createElement("h4");
    label.innerHTML = title;
    label.style.color = "white";
    label.style.margin = "0 0 5px 0";
    // Add these new styles
    label.style.fontWeight = "700";
    label.style.fontSize = "1.3rem";
    label.style.letterSpacing = "0.5px";

    const display = document.createElement("p");
    display.id = id;
    display.innerHTML = "Waiting...";
    display.style.color = "#DD5B8A";
    display.style.fontSize = "1.1rem";
    display.style.margin = "5px 0";
    display.style.wordBreak = "break-word";
    display.style.lineHeight = "1.5";

    section.appendChild(label);
    section.appendChild(display);
    return section;
  };

  function initializeIslandAndSidebar() {
    if (document.body) {
      console.log("Body found. Adding island and sidebar.");
  
      const style = document.createElement('style');
      style.textContent = `
        #island {
          position: fixed;
          bottom: 20px;
          right: 20px; /* Default position just to the left of the sidebar */
          z-index: 1000;
          transition: right 0.3s ease-in-out;
        }
  
        #island button {
          padding: 10px;
          border: none;
          background-color: #542C9C;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
          width: 100%;
          max-width: 150px;
          text-align: center;
        }
  
        #island button:hover {
          background-color: #6b3bc4;
        }
  
        #sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background: #f4f4f4;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
          z-index: 999;
        }
  
        #sidebar-content {
          padding: 20px;
        }
  
        #close-sidebar {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px 20px;
        border: none;
        background: #dc3545;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
      }
  
        #close-sidebar:hover {
          background-color: #e74c3c;
        }
      `;
      document.head.appendChild(style);
  
      const island = document.createElement('div');
      island.id = 'island';
      island.innerHTML = `<button id="optimize-button">Optimize</button>`;
      document.body.appendChild(island);
  
      const sidebar = document.createElement('div');
      sidebar.id = 'sidebar';
      sidebar.innerHTML = `
        <div id="sidebar-content">
          <h2>Insights</h2>
          <button id="close-sidebar">Close</button>
          <p>This is hardcoded Sidebar text.</p>
        </div>
      `;
      document.body.appendChild(sidebar);
  
      const optimizeButton = document.getElementById('optimize-button');
      const closeButton = document.getElementById('close-sidebar');

      closeButton.onclick = () => {
        sidebar.style.transform = 'translateX(100%)';
        island.style.right = '20px';
        optimizeButton.textContent = 'Optimize';
        updateButtonBehavior();
      };
  
      const updateButtonBehavior = () => {
        chrome.storage.local.get('alwaysShowInsights', (data) => {
          const alwaysShowInsights = !!data.alwaysShowInsights;
  
          if (alwaysShowInsights) {
            optimizeButton.textContent = 'Optimize';
            optimizeButton.onclick = () => {
              sidebar.style.transform = 'translateX(0)';
              island.style.right = '320px';
              optimizeButton.textContent = 'Close Sidebar';
  
              optimizeButton.onclick = () => {
                sidebar.style.transform = 'translateX(100%)';
                island.style.right = '20px';
                optimizeButton.textContent = 'Optimize';
                updateButtonBehavior();
              };
            };
          } else {
            optimizeButton.textContent = 'Optimize';
            optimizeButton.onclick = () => {
              optimizeButton.textContent = 'Show Sidebar';
  
              optimizeButton.onclick = () => {
                sidebar.style.transform = 'translateX(0)';
                island.style.right = '320px';
                optimizeButton.textContent = 'Close Sidebar';

                optimizeButton.onclick = () => {
                  sidebar.style.transform = 'translateX(100%)';
                  island.style.right = '20px';
                  optimizeButton.textContent = 'Optimize';
                  updateButtonBehavior();
                };
              };
            };
          }
        });
      };
  
      updateButtonBehavior();
  
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.alwaysShowInsights && namespace === 'local') {
          console.log('alwaysShowInsights changed:', changes.alwaysShowInsights.newValue);
          updateButtonBehavior(); 
        }
      });
    } else {
      console.warn("Body not found. Retrying...");
      setTimeout(initializeIslandAndSidebar, 500);
    }
  }
  
  initializeIslandAndSidebar();

  const originalPromptSection = createSection("Original Prompt:", "original-prompt-display");
  const enhancedPromptSection = createSection("Enhanced Prompt:", "enhanced-prompt-display", true, "enhanced-prompt-section");
  const answerSection = createSection("Answer:", "answer-display", true, "answer-section");

  // Create dropdown button for enhanced prompt
  const dropdownButton = document.createElement("button");
  dropdownButton.textContent = "Show Enhanced Prompt";
  dropdownButton.style.backgroundColor = "transparent";
  dropdownButton.style.border = "1px solid #DD5B8A";
  dropdownButton.style.color = "#DD5B8A";
  dropdownButton.style.padding = "5px 10px";
  dropdownButton.style.borderRadius = "4px";
  dropdownButton.style.cursor = "pointer";
  dropdownButton.style.marginBottom = "10px";
  dropdownButton.style.width = "100%";
  dropdownButton.style.display = "none"; // Hidden initially
  dropdownButton.id = "enhanced-prompt-toggle";

  dropdownButton.addEventListener("click", () => {
    const section = document.getElementById("enhanced-prompt-section");
    if (section) {
      const isHidden = section.style.display === "none";
      section.style.display = isHidden ? "block" : "none";
      dropdownButton.textContent = isHidden ? "Hide Enhanced Prompt" : "Show Enhanced Prompt";
    }
  });

  body.appendChild(originalPromptSection);
  body.appendChild(dropdownButton);
  body.appendChild(enhancedPromptSection);
  body.appendChild(answerSection);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Enhance";
  submitButton.style.padding = "10px 20px";
  submitButton.style.backgroundColor = "#542C9C";
  submitButton.style.color = "white";
  submitButton.style.border = "none";
  submitButton.style.borderRadius = "8px";
  submitButton.style.cursor = "pointer";
  submitButton.style.fontSize = "1rem";
  submitButton.style.marginTop = "10px";
  submitButton.style.width = "100%";
  submitButton.style.transition = "background-color 0.2s";

  submitButton.addEventListener("mouseover", () => {
    submitButton.style.backgroundColor = "#6b3bc4";
  });
  submitButton.addEventListener("mouseout", () => {
    submitButton.style.backgroundColor = "#542C9C";
  });

  submitButton.addEventListener("click", () => {
    sendToEngine();
    // Hide the enhanced prompt section when submitting new request
    const enhancedSection = document.getElementById("enhanced-prompt-section");
    if (enhancedSection) {
      enhancedSection.style.display = "none";
    }
    // Reset dropdown button text
    const dropdownBtn = document.getElementById("enhanced-prompt-toggle");
    if (dropdownBtn) {
      dropdownBtn.textContent = "Show Enhanced Prompt";
    }
  });

  header.appendChild(h3);
  popup.appendChild(header);
  popup.appendChild(body);
  popup.appendChild(submitButton);

  document.body.appendChild(popup);
  console.log("Floating popup added to the page.");
}

const formatMarkdown = async (text) => {
  // const marked = await injectMarked();

  // // Configure marked options
  // marked.setOptions({
  //   breaks: true,
  //   gfm: true,
  //   headerIds: false,
  //   mangle: false,
  //   sanitize: false,
  //   pedantic: false,
  //   smartLists: true
  // });

  // // Create custom renderer
  // const renderer = new marked.Renderer();

  // renderer.heading = (text, level) => {
  //   return `<h${level} style="color: #DD5B8A; margin: 0.8em 0; font-weight: 600;">${text}</h${level}>`;
  // };

  // renderer.strong = (text) => {
  //   return `<strong style="color: #DD5B8A; display: inline-block; margin-top: 0.5em;">${text}</strong>`;
  // };

  // renderer.paragraph = (text) => {
  //   return `<p style="margin: 0.5em 0;">${text}</p>`;
  // };

  // renderer.list = (body, ordered) => {
  //   const type = ordered ? 'ol' : 'ul';
  //   return `<${type} style="margin: 0.5em 0; padding-left: 1.5em;">${body}</${type}>`;
  // };

  // // Convert markdown to HTML with custom styling
  // const htmlContent = marked(text, { renderer });
  // return `<div style="line-height: 1.6; color: white;">${htmlContent}</div>`;
  return simpleMarkdown.parse(text);
};

const sendToEngine = async () => {
  console.log("SUBMIT BUTTON PRESSED");
  try {
    const storageData = await new Promise((resolve) =>
      chrome.storage.local.get("typedText", resolve)
    );

    originalPrompt= storageData.typedText || "No text available";
    console.log("Sending text:", originalPrompt);

    // Update original prompt immediately
    const originalPromptDisplay = document.getElementById("original-prompt-display");
    if (originalPromptDisplay) {
      originalPromptDisplay.textContent = originalPrompt;
    }

  //COMMENT OUT TO SWITCH HARDCODE TO API
    
   // const data = await window.callEnhancerAPI(originalPrompt);
   const data = {
    enhancedPrompt: "This is a hardcoded enhanced prompt.",
    answer: "This is a hardcoded answer."
  };

    // Format both prompts before updating the UI
    const [formattedEnhancedPrompt, formattedAnswer] = await Promise.all([
      formatMarkdown(data.enhancedPrompt || "No enhanced prompt available"),
      formatMarkdown(data.answer || "No answer available")
    ]);

    // Update UI with formatted content
    const enhancedPromptDisplay = document.getElementById("enhanced-prompt-display");
    const answerSection = document.getElementById("answer-section");
    const answerDisplay = document.getElementById("answer-display");
    const dropdownButton = document.getElementById("enhanced-prompt-toggle");

    if (enhancedPromptDisplay) {
      enhancedPromptDisplay.innerHTML = formattedEnhancedPrompt;
    }

    if (answerDisplay) {
      answerDisplay.innerHTML = formattedAnswer;
    }

    if (answerSection) {
      answerSection.style.display = "block";
    }

    if (dropdownButton) {
      dropdownButton.style.display = "block";
    }

    injectEnhancedPrompt(data.enhancedPrompt);

  } catch (error) {
    console.error('Error in sendToEngine:', error);
    const answerSection = document.getElementById("answer-section");
    const answerDisplay = document.getElementById("answer-display");

    if (answerSection) {
      answerSection.style.display = "block";
    }
    if (answerDisplay) {
      answerDisplay.textContent = "Error: Could not process request";
    }
  }
};

function updatePopupContent() {
  chrome.storage.local.get("typedText", (data) => {
    const typedText = data.typedText || "Waiting for input...";
    const display = document.getElementById("original-prompt-display");
    console.log("original prompt: " + originalPrompt);
    if (display) {
      display.textContent = typedText;
    }
  });
}

const injectEnhancedPrompt = (enhancedPrompt) => {
  const inputBox = document.querySelector('.ProseMirror'); 
  if (inputBox) {
    inputBox.innerHTML = enhancedPrompt; 
    const event = new Event('input', { bubbles: true });
    inputBox.dispatchEvent(event);
    console.log("Enhanced prompt injected:", enhancedPrompt);
  } else {
    console.error("ChatGPT input box not found. Cannot inject enhanced prompt.");
  }
};

findInputBoxWithRetry();

