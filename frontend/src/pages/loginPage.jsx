// frontend/src/pages/loginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Pill } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to log in. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
        <div className="auth-container">
            <div className="sidebar-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                <Pill size={32} className="logo-icon" />
                <h1 className="logo-text">HealthMate</h1>
            </div>
            <h2>Welcome Back</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <p className="auth-link">
                Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
        </div>
    </div>
  );
};

export default LoginPage;
