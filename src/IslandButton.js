import React from 'react';

function IslandButton({ alwaysShowInsights, isSidebarOpen, setIsSidebarOpen }) {
  const handleClick = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    } else if (alwaysShowInsights) {
      setIsSidebarOpen(true);
    }
  };

  const handleSecondaryClick = () => {
    setIsSidebarOpen(true);
  };

  return (
    <div id="island" style={{ position: 'fixed', bottom: '20px', right: isSidebarOpen ? '320px' : '20px' }}>
      <button
        style={{
          padding: '10px',
          backgroundColor: '#542C9C',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={isSidebarOpen || alwaysShowInsights ? handleClick : handleSecondaryClick}
      >
        {isSidebarOpen
          ? 'Close Sidebar'
          : alwaysShowInsights
          ? 'Optimize'
          : 'Show Sidebar'}
      </button>
    </div>
  );
}

export default IslandButton;
