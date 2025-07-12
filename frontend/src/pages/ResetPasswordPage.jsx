// frontend/src/pages/ResetPasswordPage.jsx

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { resetPassword } from '../api';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword({ token, password });
            setIsSuccess(true);
        } catch (err) {
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
                {isSuccess ? (
                     <div className="auth-card-content text-center">
                        <motion.div 
                            className="logo-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ background: 'var(--success-color)'}}
                        >
                            <CheckCircle size={28} />
                        </motion.div>
                        <h2 className="auth-title">Password Reset!</h2>
                        <p className="auth-subtitle" style={{color: 'var(--text-secondary)', margin: '1rem 0 2rem 0'}}>
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{width: '100%'}}>
                            Proceed to Sign In
                        </Link>
                    </div>
                ) : (
                    <div className="auth-card-content">
                        <div className="auth-card-header">
                             <h2 className="auth-title">Create New Password</h2>
                             <p className="auth-subtitle" style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                                Your new password must be different from previous passwords.
                             </p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <div className="input-with-icon">
                                    <Key size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>
                             <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <div className="input-with-icon">
                                    <Key size={18} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm your new password"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="btn-auth-premium" disabled={loading} style={{ marginTop: '1rem' }}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
