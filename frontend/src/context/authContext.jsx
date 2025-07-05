import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Load user from token on app start
  useEffect(() => {
    if (token) {
      setUser({ token }); // For simplicity. You can decode token for more info if needed.
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);
      setUser({ token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Login failed" };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.error || "Signup failed" };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
