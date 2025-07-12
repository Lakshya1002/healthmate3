// frontend/src/pages/loginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { Pill, Mail, Key } from 'lucide-react';
import Button from '../components/ui/Button';

// Google Icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-6.627-5.373-12-12-12S0 5.373 0 12s5.373 12 12 12 12-5.373 12-12z" />
    <path d="M12 22.5c-2.8 0-5.3-1-7.4-2.6" />
    <path d="M12 1.5c2.8 0 5.3 1 7.4 2.6" />
    <path d="M1.5 12c0-2.8 1-5.3 2.6-7.4" />
    <path d="M22.5 12c0 2.8-1 5.3-2.6 7.4" />
    <path d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z" />
    <path d="M12 6.5v0c1.5 0 2.8.6 3.8 1.6" />
  </svg>
);


// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
};

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
    <div className="auth-layout-premium">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          className="auth-card-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="auth-card-header" variants={itemVariants}>
            <span className="logo-icon"><Pill size={24} /></span>
            <h2 className="auth-title">Welcome Back</h2>
          </motion.div>

          {error && <div className="error-message">{error}</div>}

          <motion.form onSubmit={handleSubmit} className="auth-form" variants={itemVariants}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Key size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="auth-options">
                <div></div> {/* Spacer */}
                <Link to="#">Forgot Password?</Link>
            </div>

            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{marginTop: '1.5rem'}}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.form>
          
          <motion.div className="auth-divider" variants={itemVariants}>OR</motion.div>

          <motion.div variants={itemVariants}>
            <Button className="btn-social">
                <GoogleIcon />
                Sign in with Google
            </Button>
          </motion.div>

          <motion.p variants={itemVariants} className="auth-footer-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
