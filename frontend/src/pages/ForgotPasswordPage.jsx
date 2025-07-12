// frontend/src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ FIXED: This now makes the actual API call to the backend.
            await requestPasswordReset({ email });
            setIsSubmitted(true);
            // The success toast is now shown by the API interceptor on a successful call.
        } catch (err) {
            // The API interceptor will show an error toast.
            // We just log the error here for debugging.
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout-premium">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                {isSubmitted ? (
                    <div className="auth-card-content" style={{textAlign: 'center'}}>
                        <motion.div 
                            className="logo-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ background: 'var(--success-color)', margin: '0 auto 1rem auto'}}
                        >
                            <Send size={28} />
                        </motion.div>
                        <h2 className="auth-title">Check Your Email</h2>
                        <p style={{color: 'var(--text-secondary)', margin: '1rem 0 2rem 0'}}>
                            If an account with the email <strong>{email}</strong> exists, we've sent a link to reset your password.
                        </p>
                        <Link to="/login" className="btn btn-secondary" style={{width: '100%', textDecoration: 'none'}}>
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <div className="auth-card-content">
                        <div className="auth-card-header" style={{marginBottom: '1rem', textAlign: 'center'}}>
                             <h2 className="auth-title">Forgot Password?</h2>
                             <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                                No worries, we'll send you reset instructions.
                             </p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form">
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
                            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                        <p className="auth-footer-link" style={{marginTop: '2rem', textAlign: 'center'}}>
                            <Link to="/login" style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}><ArrowLeft size={14}/> Back to Sign In</Link>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
