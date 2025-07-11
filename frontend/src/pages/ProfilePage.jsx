// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { updateUserProfile } from '../api';
import toast from 'react-hot-toast';
import { User, Mail, Key } from 'lucide-react';
import Button from '../components/ui/Button';
import Loader from '../components/Loader';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, username: user.username, email: user.email }));
            setIsLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const updateData = {
            username: formData.username,
            email: formData.email,
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        const promise = updateUserProfile(updateData);

        toast.promise(promise, {
            loading: 'Updating profile...',
            success: 'Profile updated successfully!',
            error: 'Failed to update profile.'
        });

        try {
            const { data } = await promise;
            setUser(prevUser => ({ ...prevUser, ...data }));
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Your Profile</h1>
                <p>Manage your account settings and personal information.</p>
            </div>
            <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-with-icon">
                            <User size={20} />
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={20} />
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <hr className="form-divider" />
                    <p className="form-section-header">Change Password</p>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                         <div className="input-with-icon">
                            <Key size={20} />
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                         <div className="input-with-icon">
                            <Key size={20} />
                            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
