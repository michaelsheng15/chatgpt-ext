import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

function mountApp() {
  const container = document.getElementById('react-app-container');
  if (container) {
    console.log('Container found. Mounting React app...');
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React app successfully mounted.');
  } else {
    console.warn('Container not found. Retrying...');
    setTimeout(mountApp, 100); // Retry after 100ms if the container isn't ready
  }
}

mountApp();
