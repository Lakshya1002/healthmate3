// frontend/src/context/authContext.jsx

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { setAuthToken, loginUser, registerUser, getMe } from '../api';
import Loader from '../components/Loader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  }), [user, loading]);

  if (loading) {
    return <Loader />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
