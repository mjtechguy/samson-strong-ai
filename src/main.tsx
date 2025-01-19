import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { initializeApp } from './services/initialize';
import { logger } from './services/logging';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Initialize Firebase and render app
const init = async () => {
  try {
    // Initialize app features
    await initializeApp();
    
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" />
      </React.StrictMode>
    );
  } catch (error) {
    logger.error('Application initialization failed:', error);
    
    // Show error UI
    root.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #991B1B;">Application Error</h1>
          <p style="color: #666;">Failed to initialize application. Please try refreshing the page.</p>
          <p style="color: #666; font-size: 0.875rem; margin-top: 1rem;">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    `;
  }
};

init();