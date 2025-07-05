import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './App.css';

import { BrowserRouter } from 'react-router-dom'; // ✅ Added
import { AuthProvider } from './context/authContext'; // ✅ Already present

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ Needed for routing */}
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
              border: '1px solid #4a4a4a',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
