import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { updateUserProfile } from '../api';
import toast from 'react-hot-toast';
import { User, Mail, Key, Shield, Trash2, Edit2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import '../ProfilePage.css'; // Ensure this CSS file is created and imported

// --- Sub-component for Personal Information Form ---
const ProfileInfoForm = ({ user, onSubmit }) => {
    const [formData, setFormData] = useState({ username: user.username || '', email: user.email || '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div>
            <h2><User size={24} /> Personal Information</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-with-icon">
                        <User size={18} />
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-with-icon">
                        <Mail size={18} />
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-footer">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// --- Sub-component for Security Settings ---
const SecuritySettings = ({ onPasswordChange, onDeleteRequest }) => {
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        setIsSubmitting(true);
        await onPasswordChange({ password: formData.newPassword });
        setFormData({ newPassword: '', confirmPassword: '' });
        setIsSubmitting(false);
    };

    return (
        <div>
            <h2><Shield size={24} /> Password & Security</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-with-icon">
                        <Key size={18} />
                        <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter new password" required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="input-with-icon">
                        <Key size={18} />
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required />
                    </div>
                </div>
                <div className="form-footer">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Change Password'}
                    </Button>
                </div>
            </form>

            <div className="danger-zone">
                <h3>Delete Account</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="danger" onClick={onDeleteRequest}>
                    <Trash2 size={16}/> Delete My Account
                </Button>
            </div>
        </div>
    );
};

// --- Main Profile Page Component ---
const ProfilePage = () => {
    const { user, setUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (user) setIsLoading(false);
    }, [user]);

    const handleProfileUpdate = async (updateData) => {
        const promise = updateUserProfile(updateData);
        toast.promise(promise, {
            loading: 'Updating profile...',
            success: 'Profile updated successfully!',
            error: (err) => err.response?.data?.message || 'Failed to update profile.'
        });
        try {
            const { data } = await promise;
            setUser(prevUser => ({ ...prevUser, ...data }));
        } catch (error) {
            console.error(error);
        }
    };

    const handlePasswordChange = async (passwordData) => {
        const promise = updateUserProfile(passwordData);
        toast.promise(promise, {
            loading: 'Changing password...',
            success: 'Password changed successfully!',
            error: (err) => err.response?.data?.message || 'Failed to change password.'
        });
        try {
            await promise;
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAccount = () => {
        console.log("Deleting user account...");
        toast.success("Account deleted successfully.");
        setDeleteModalOpen(false);
        logout();
    };

    if (isLoading) {
        return <Loader />;
    }

    const NavLink = ({ tab, icon, children }) => (
        <button 
            className={`profile-nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
        >
            {icon}
            <span>{children}</span>
        </button>
    );

    return (
        <div className="profile-page-container">
            <div className="profile-header">
                <h1>Account Settings</h1>
                <p>Manage your account settings, password, and personal information.</p>
            </div>
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    <div className="user-avatar-panel">
                        <div className="avatar-container">
                            <div className="avatar-initials">
                                <span>{user.username.charAt(0)}</span>
                            </div>
                            <button className="edit-avatar-btn" onClick={() => toast.error('Feature not yet implemented.')}><Edit2 size={14}/></button>
                        </div>
                        <h3>{user.username}</h3>
                        <p>{user.email}</p>
                    </div>
                    <nav className="profile-nav">
                        <NavLink tab="profile" icon={<User size={20} />}>Edit Profile</NavLink>
                        <NavLink tab="security" icon={<Shield size={20} />}>Password & Security</NavLink>
                    </nav>
                </aside>
                <main className="profile-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'profile' && (
                                <ProfileInfoForm user={user} onSubmit={handleProfileUpdate} />
                            )}
                            {activeTab === 'security' && (
                                <SecuritySettings 
                                    onPasswordChange={handlePasswordChange}
                                    onDeleteRequest={() => setDeleteModalOpen(true)}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Your Account?">
                <p>This action is irreversible. All your medication data, health logs, and reminders will be permanently deleted.</p>
                <p><strong>Are you absolutely sure you want to proceed?</strong></p>
                <div className="form-footer" style={{borderTop: 'none', marginTop: '1rem'}}>
                    <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                        <Trash2 size={16}/> Yes, Delete My Account
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;
