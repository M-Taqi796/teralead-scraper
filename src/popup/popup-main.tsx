import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';
import '../styles/popup.css';

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
