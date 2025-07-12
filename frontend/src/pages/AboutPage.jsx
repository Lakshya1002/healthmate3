import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldCheck, Zap, Target } from 'lucide-react';
import '../AboutPage.css'; // Import the new CSS

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div className="feature-card" variants={itemVariants}>
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </motion.div>
);

const AboutPage = () => {
    return (
        <div className="about-page-container">
            <motion.section 
                className="about-hero"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="hero-icon"><HeartPulse size={32} /></div>
                <h1>Your Health, Simplified.</h1>
                <p className="subtitle">
                    HealthMate is a modern, privacy-focused tool designed to make medication management effortless. 
                    Track your regimen, log your vitals, and stay on top of your health journey with a clean, intuitive interface.
                </p>
            </motion.section>

            <motion.section 
                className="features-section"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="features-grid">
                    <FeatureCard
                        icon={<Zap size={32} />}
                        title="Effortless Tracking"
                        description="Quickly add, view, and manage your medications with a streamlined dashboard and dual view modes."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={32} />}
                        title="Private & Secure"
                        description="Your health data is sensitive. We prioritize your privacy with secure authentication and data handling."
                    />
                    <FeatureCard
                        icon={<Target size={32} />}
                        title="Focused Design"
                        description="No clutter, no distractions. Just the essential tools you need to manage your health effectively."
                    />
                </div>
            </motion.section>

            <motion.section 
                className="mission-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
            >
                <div className="mission-content">
                    <h2>Our Mission</h2>
                    <p>
                        In a world of complex health challenges, managing medication shouldn't be one of them. 
                        HealthMate was born from a simple idea: to provide a straightforward, secure, and user-friendly tool 
                        to help individuals track their medication schedules without the clutter of unnecessary features.
                    </p>
                    <p>
                        This project was developed to showcase proficiency in full-stack development using modern technologies like React, Node.js, and MySQL, representing a passion for creating practical solutions to real-world problems.
                    </p>
                </div>
                 <div className="mission-image">
                    <img 
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                        alt="Doctor using a tablet"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/4f46e5/ffffff?text=Health+Tech'; }}
                    />
                </div>
            </motion.section>

             <motion.section 
                className="developer-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7 }}
            >
                <h2>The Developer</h2>
                <div className="developer-card">
                    <img 
                        src="https://placehold.co/120x120/0f172a/64ffda?text=LS" 
                        alt="Lakshya Sabharwal"
                    />
                    <div className="developer-info">
                        <h4>Lakshya Sabharwal</h4>
                        <p>Full-Stack Developer</p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default AboutPage;
