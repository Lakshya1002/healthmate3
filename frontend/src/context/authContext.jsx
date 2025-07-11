// frontend/src/context/authContext.jsx

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { setAuthToken, loginUser, registerUser, getMe } from '../api';
import Loader from '../components/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

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

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };
  
  const value = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    theme,
    toggleTheme
  }), [user, loading, theme]);

  if (loading) {
    return <Loader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
