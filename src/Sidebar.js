import React from 'react';

function Sidebar({ isOpen, onClose }) {
  return (
    <div
      id="sidebar"
      style={{
        position: 'fixed',
        top: '0',
        right: isOpen ? '0' : '-300px',
        width: '300px',
        height: '100%',
        background: '#f4f4f4',
        boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease-in-out',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        zIndex: '999',
      }}
    >
      <div
        style={{
          padding: '20px',
        }}
      >
        <h2>Sidebar</h2>
        <p>This is your sidebar content.</p>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Close Sidebar
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
