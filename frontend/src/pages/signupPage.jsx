// frontend/src/pages/signupPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { Pill, Mail, Key, User, Eye, EyeOff } from 'lucide-react';
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

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin: authGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // ✅ UPDATED: The handleSubmit function now includes the user's timezone.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Automatically detect the browser's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await signup({ username, email, password, timezone });
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sign up. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: The Google login handler now also sends the timezone.
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await authGoogleLogin(credentialResponse.credential, timezone);
      navigate('/');
    } catch (err) {
      setError('Google Sign-Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-Up failed. Please try again.');
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
            <span className="logo-icon"><Pill size={28} /></span>
            <h2 className="auth-title">Create Your Account</h2>
          </motion.div>

          {error && <div className="error-message">{error}</div>}

          <motion.form onSubmit={handleSubmit} className="auth-form" variants={itemVariants}>
            <div className="form-group">
              <label htmlFor="username">Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>
            
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{marginTop: '1.5rem'}}>
              {loading ? 'Creating Account...' : 'Sign Up'}
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
            Already have an account? <Link to="/login">Sign In</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
