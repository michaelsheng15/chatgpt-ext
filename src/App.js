import React, { useState } from 'react';
import './App.css';

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div>
      {/* Floating Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '10000',
        }}
      >
        <button
          style={{
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#542C9C',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onClick={toggleSidebar}
        >
          {isSidebarVisible ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
      </div>

      {/* Sidebar */}
      {isSidebarVisible && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '300px',
            height: '100%',
            backgroundColor: '#f4f4f4',
            boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.2)',
            zIndex: '9999',
            padding: '20px',
          }}
        >
          <h2>Sidebar</h2>
          <p>This is your sidebar content.</p>
          <button
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={toggleSidebar}
          >
            Close Sidebar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
