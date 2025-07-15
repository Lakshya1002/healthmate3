// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, LayoutDashboard, PlusCircle, Info, Mail, HeartPulse, Bell, LogOut, User, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';

import Dashboard from './pages/Dashboard';
import AddMedicinePage from './pages/AddMedicinePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import HealthLogPage from './pages/healthLogPage';
import RemindersPage from './pages/remindersPage';
import AddReminderPage from './pages/AddReminderPage';
import EditReminderPage from './pages/EditReminderPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ✅ IMPORT
import ResetPasswordPage from './pages/ResetPasswordPage';   // ✅ IMPORT
import ThemeToggle from './components/ui/ThemeToggle';

import { useAuth } from './context/authContext';
import { registerServiceWorker, subscribeUserToPush } from './utils/notificationUtils';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEnableAlertsClick = async () => {
    setIsSubscribing(true);
    const toastId = toast.loading("Requesting notification permission...");
    try {
      const result = await subscribeUserToPush();
      if (result.status === 'success') {
        toast.success("Successfully subscribed! You'll receive a welcome notification shortly.", { id: toastId, duration: 5000 });
      } else if (result.status === 'already-subscribed') {
        toast.success("You are already subscribed to notifications.", { id: toastId, duration: 4000 });
      } else if (result.status === 'denied') {
        toast.error("Permission denied. To enable notifications, please go to your browser settings.", { id: toastId, duration: 5000 });
      } else {
        toast.error("Could not subscribe to notifications. Please try again.", { id: toastId, duration: 4000 });
      }
    } catch (error) {
      console.error("Subscription process failed:", error);
      toast.error("An unexpected error occurred during subscription.", { id: toastId, duration: 4000 });
    } finally {
      setIsSubscribing(false);
    }
  };

  const NavLink = ({ to, icon, children }) => (
    <Link to={to} className={`nav-link ${location.pathname.startsWith(to) && to !== '/' || location.pathname === to ? 'active' : ''}`}>
      {icon}
      <span className="nav-text">{children}</span>
      {location.pathname.startsWith(to) && to !== '/' || location.pathname === to ? (
        <motion.div className="active-nav-indicator" layoutId="activeNav" />
      ) : null}
    </Link>
  );

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  
  // ✅ UPDATED: Include the new password reset paths
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some(path => location.pathname.startsWith(path));

  return (
    <div className="app-layout">
      {!isAuthPage && isAuthenticated && (
        <header className="app-header">
          <div className="header-logo">
            <Pill size={32} />
            <h1>HealthMate</h1>
          </div>
          <nav className="header-nav">
            <NavLink to="/" icon={<LayoutDashboard size={20} />}>Dashboard</NavLink>
            <NavLink to="/add" icon={<PlusCircle size={20} />}>Add Medicine</NavLink>
            <NavLink to="/reminders" icon={<Bell size={20} />}>Reminders</NavLink> 
            <NavLink to="/health-log" icon={<HeartPulse size={20} />}>Health Logs</NavLink>
            <NavLink to="/about" icon={<Info size={20} />}>About</NavLink>
            <NavLink to="/contact" icon={<Mail size={20} />}>Contact</NavLink>
            <NavLink to="/profile" icon={<User size={20} />}>Profile</NavLink>
            <ThemeToggle />
            <button 
              className="nav-link" 
              onClick={handleEnableAlertsClick} 
              disabled={isSubscribing}
              title="Enable Notifications"
            >
                <BellRing size={20} />
                <span className="nav-text">{isSubscribing ? 'Subscribing...' : 'Enable Alerts'}</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={20}/> Logout</button>
          </nav>
        </header>
      )}

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} />
              {/* ✅ ADDED: New routes for the password reset flow */}
              <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={isAuthenticated ? <Navigate to="/" /> : <ResetPasswordPage />} />

              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/add" element={<ProtectedRoute><AddMedicinePage /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
              <Route path="/reminders/add" element={<ProtectedRoute><AddReminderPage /></ProtectedRoute>} />
              <Route path="/reminders/edit/:id" element={<ProtectedRoute><EditReminderPage /></ProtectedRoute>} />
              <Route path="/health-log" element={<ProtectedRoute><HealthLogPage /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
