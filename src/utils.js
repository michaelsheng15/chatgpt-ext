// utils.js - Contains helper functions.


export const scrape = () => {
    const inputBox = document.querySelector(".ProseMirror");
    if (!inputBox) {
      console.error("ChatGPT input box not found.");
      return "";
    }
    return inputBox.innerText.trim();
  };
  
  export const injectPrompt = (enhancedPrompt) => {
    const inputBox = document.querySelector(".ProseMirror");
    if (inputBox) {
      inputBox.innerHTML = enhancedPrompt;
      inputBox.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      console.error("ChatGPT input box not found. Cannot inject enhanced prompt.");
    }
  };
  

  //TEMPORARY FUNCTIONS TO SIMULATE API CALL
  export const fetchNodeData = async (nodeName) => {
    console.log(`[fetchNodeData] Fetching data for ${nodeName}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          changeText: `This is the change for ${nodeName}.`,
          reasonText: `Reason why ${nodeName} made this change.`,
        };
        console.log(`[fetchNodeData] Data for ${nodeName}:`, data);
        resolve(data);
      }, 5000);   //timeout to simulate, DELETE eventually
    });
  };

  export const fetchScoreData = async () => {
    console.log("[fetchScoreData] Fetching score data...");
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          score: 55,
          scoreRationale: "Your prompt was clear but could be more detailed. (Hardcoded)",
          improvementTips: "Consider adding more context and specifics to your prompt. (HardCoded)",
        };
        console.log("[fetchScoreData] Data:", data);
        resolve(data);
      }, 3000);    //timeout to simulate, DELETE eventually
    });
  }








///Below are not being used

export const formatMarkdown = async (text) => {
    return simpleMarkdown.parse(text);
};

export const simpleMarkdown = {
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
}