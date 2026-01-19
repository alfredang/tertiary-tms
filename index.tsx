import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LmsProvider } from './context/LmsContext';
import { initializeDatabase } from './services/apiService';

// Initialize the mock database before rendering the app
initializeDatabase();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LmsProvider>
      <App />
    </LmsProvider>
  </React.StrictMode>
);