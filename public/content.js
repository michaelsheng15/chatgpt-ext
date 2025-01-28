// Inject a container for the React app
const appContainer = document.createElement('div');
appContainer.id = 'react-app-container';
appContainer.style.position = 'fixed';
appContainer.style.bottom = '20px';
appContainer.style.right = '20px';
appContainer.style.zIndex = '10000'; // Ensure it's above other elements
appContainer.style.width = 'auto'; // Automatically fit content
appContainer.style.height = 'auto'; // Automatically fit content
document.body.appendChild(appContainer);

// Dynamically load the React app's main JavaScript bundle using asset-manifest.json
fetch(chrome.runtime.getURL('asset-manifest.json'))
  .then((response) => response.json())
  .then((manifest) => {
    const mainJs = manifest['files']['main.js']; // Dynamically find the main JS file
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(mainJs);
    script.type = 'module'; // Modern React builds use modules
    document.body.appendChild(script);
    console.log('React app script injected:', script.src);
  })
  .catch((error) => {
    console.error('Failed to load React app:', error);
  });
