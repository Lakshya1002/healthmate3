// frontend/src/App.jsx

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, LayoutDashboard, HeartPulse, Info, Mail, LogOut, Menu, X } from 'lucide-react';

// --- Page Imports ---
import Dashboard from './pages/Dashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import HealthLogPage from './pages/HealthLogPage';

// --- Context & CSS ---
import { useAuth } from './context/authContext';
import './App.css';
import './HealthLog.css';

// --- Layout Components ---
const NavLink = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`} onClick={onClick}>
            {icon}
            <span className="nav-text">{children}</span>
        </Link>
    );
};

const Sidebar = ({ onLinkClick }) => {
    const { logout } = useAuth();
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Pill size={32} className="logo-icon" />
                <h1 className="logo-text">HealthMate</h1>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" icon={<LayoutDashboard size={20} />} onClick={onLinkClick}>Dashboard</NavLink>
                <NavLink to="/health-logs" icon={<HeartPulse size={20} />} onClick={onLinkClick}>Health Logs</NavLink>
                <NavLink to="/about" icon={<Info size={20} />} onClick={onLinkClick}>About</NavLink>
                <NavLink to="/contact" icon={<Mail size={20} />} onClick={onLinkClick}>Contact</NavLink>
            </nav>
            <div className="sidebar-footer">
                <button className="nav-link logout-btn" onClick={logout}>
                    <LogOut size={20} />
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

const MainLayout = ({ children }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className={`main-layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            <div className="mobile-header">
                <Link to="/" className="mobile-logo">
                    <Pill size={28} />
                    <span>HealthMate</span>
                </Link>
                <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            <Sidebar onLinkClick={() => setMobileMenuOpen(false)} />
            <div className="content-scroller">
                <main className="content-area">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={useLocation().pathname}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                in: { opacity: 1, y: 0 },
                                out: { opacity: 0, y: -20 },
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

function App() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-screen"><div className="loader"></div></div>;
    }

    return (
        <div className="app-container">
            <Routes location={location} key={location.pathname}>
                {user ? (
                    <Route path="/*" element={
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/health-logs" element={<HealthLogPage />} />
                                <Route path="/about" element={<AboutPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </MainLayout>
                    } />
                ) : (
                    <>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                )}
            </Routes>
        </div>
    );
}

export default App;
