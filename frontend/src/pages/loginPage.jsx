// frontend/src/pages/loginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { Pill, Mail, Key, Eye, EyeOff } from 'lucide-react'; // ✅ Import Eye and EyeOff icons
import Button from '../components/ui/Button';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

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
  const [showPassword, setShowPassword] = useState(false); // ✅ State for password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin: authGoogleLogin } = useAuth();
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
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await authGoogleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed. Please try again.');
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
                  type={showPassword ? 'text' : 'password'} // ✅ Toggle input type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {/* ✅ Add toggle button */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="auth-options">
                <div></div> {/* Spacer */}
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{marginTop: '1.5rem'}}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </motion.form>
          
          <motion.div className="auth-divider" variants={itemVariants}>OR</motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
            />
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
