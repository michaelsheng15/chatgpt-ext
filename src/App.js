import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [alwaysShowInsights, setAlwaysShowInsights] = useState(true); // I want this to default to true, not sure why it doesn't work  -Donovan

  useEffect(() => {
    chrome.storage.local.get('alwaysShowInsights', (data) => {
      if (data.alwaysShowInsights !== undefined) {
        setAlwaysShowInsights(data.alwaysShowInsights);
      } else {
        chrome.storage.local.set({ alwaysShowInsights: true }, () => {      //using chrome storage to save the setting, there might be a better way tbh  -Donovan
          console.log('Default value set: alwaysShowInsights = true');
        });
        setAlwaysShowInsights(true); 
      }
    });
  }, []);

  const handleToggleChange = (e) => {
    const newValue = e.target.checked;
    setAlwaysShowInsights(newValue);

    chrome.storage.local.set({ alwaysShowInsights: newValue }, () => {
      console.log(`Always Show Insights updated to: ${newValue}`);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Settings</h2>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={alwaysShowInsights}
            onChange={handleToggleChange}
          />
          Always Show Insights
        </label>
      </header>
    </div>
  );
}

export default App;
