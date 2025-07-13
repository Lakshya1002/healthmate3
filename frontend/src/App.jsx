// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, LayoutDashboard, PlusCircle, Info, Mail, HeartPulse, Bell, LogOut, User } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import AddMedicinePage from './pages/AddMedicinePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import HealthLogPage from './pages/healthLogPage';
import RemindersPage from './pages/remindersPage';
import AddReminderPage from './pages/AddReminderPage';
import EditReminderPage from './pages/EditReminderPage'; // Import the new edit page
import ProfilePage from './pages/ProfilePage';
import ThemeToggle from './components/ui/ThemeToggle';

import { useAuth } from './context/authContext';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon, children }) => (
    <Link to={to} className={`nav-link ${location.pathname.startsWith(to) && to !== '/' || location.pathname === to ? 'active' : ''}`}>
      {icon}
      <span className="nav-text">{children}</span>
      {location.pathname.startsWith(to) && to !== '/' || location.pathname === to && (
        <motion.div className="active-nav-indicator" layoutId="activeNav" />
      )}
    </Link>
  );

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

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