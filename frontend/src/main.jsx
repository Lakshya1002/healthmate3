import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './App.css';
import './Auth.css'; // ✅ ADDED: Import the new professional auth styles

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'hot-toast',
            style: {
              background: 'var(--card-background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
