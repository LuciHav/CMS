import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Ensure the correct path to your CSS file
import App from './App'; // Ensure App is correctly imported

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
