// frontend/src/context/authContext.jsx

import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { setAuthToken, loginUser, registerUser, getMe, googleLogin as apiGoogleLogin } from '../api';
import Loader from '../components/Loader';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the custom hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. Create the provider component
const AuthProviderComponent = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('theme') || 'light';
      }
      return 'light';
  });

  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // ✅ Memoize the logout function with useCallback
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const { data } = await getMe();
          setUser(data);
        } catch (error) {
          console.error("Auth token verification failed", error);
          logout(); // Use the consistent logout function
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [logout]);

  // ✅ ADDED: This effect listens for the 'unauthorized' event from the API interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
        console.log("Unauthorized event caught from API. Logging out.");
        logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    // Cleanup the event listener when the component unmounts
    return () => {
        window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    localStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setUser({ id: data.id, username: data.username, email: data.email });
  };

  const signup = async (userData) => {
    const { data } = await registerUser(userData);
    localStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setUser({ id: data.id, username: data.username, email: data.email });
  };
  
  const googleLogin = async (googleCredential) => {
    const { data } = await apiGoogleLogin({ credential: googleCredential });
    localStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setUser({ id: data.id, username: data.username, email: data.email });
  };
  
  const value = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    theme,
    toggleTheme
  }), [user, loading, theme, logout]);

  if (loading) {
    return <Loader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// 4. Create the main exportable provider that includes the Google Provider
export const AuthProvider = ({ children }) => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        console.error("FATAL ERROR: VITE_GOOGLE_CLIENT_ID is not defined in .env file.");
        return <div>Configuration error: Google Client ID is missing.</div>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProviderComponent>{children}</AuthProviderComponent>
        </GoogleOAuthProvider>
    );
};
