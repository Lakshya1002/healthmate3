// frontend/src/pages/ForgotPasswordPage.jsx

import React, { useState, useEffect } from 'react';
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
    
    // State to manage the resend email functionality and cooldown.
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestPasswordReset({ email });
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handler for the "Resend Email" action.
    const handleResend = async () => {
        if (!canResend) return;

        setCanResend(false);
        toast.success("Another reset link has been sent.");
        
        // Start a 30-second cooldown timer.
        setResendCooldown(30);
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Resend the request to the backend.
        try {
            await requestPasswordReset({ email });
        } catch (err) {
            console.error(err);
        }
    };

    // Effect to manage the initial cooldown before the resend button is enabled.
    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setCanResend(true);
            }, 10000); // Enable resend after 10 seconds.
            return () => clearTimeout(timer);
        }
    }, [isSubmitted]);

    return (
        <div className="auth-layout-premium">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                {isSubmitted ? (
                    <div className="auth-card-content">
                        <div className="auth-card-header text-center">
                            <motion.div 
                                className="logo-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ background: 'var(--primary-color)'}}
                            >
                                <Send size={28} />
                            </motion.div>
                            <h2 className="auth-title">Check Your Email</h2>
                            <p className="auth-subtitle">
                                We've sent password reset instructions to <br/>
                                <strong style={{color: 'var(--text-primary)'}}>{email}</strong>.
                            </p>
                        </div>
                        
                        <Link to="/login" className="btn btn-auth-premium" style={{textDecoration: 'none'}}>
                            Back to Sign In
                        </Link>

                        <div className="resend-container">
                            Didn't receive the email? Check your spam folder, or{' '}
                            {canResend ? (
                                <button onClick={handleResend} className="btn-link">resend the email.</button>
                            ) : (
                                <span>try again {resendCooldown > 0 ? `in ${resendCooldown}s` : 'shortly'}.</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="auth-card-content">
                        <div className="auth-card-header text-center">
                             <h2 className="auth-title">Forgot Password?</h2>
                             <p className="auth-subtitle">
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
                            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{ marginTop: '1rem' }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                        <p className="auth-footer-link">
                            <Link to="/login" style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}><ArrowLeft size={14}/> Back to Sign In</Link>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
