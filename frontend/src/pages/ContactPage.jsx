import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, User, Send, Linkedin, Twitter, Github } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import '../ContactPage.css'; // CORRECTED: The path is now correct.

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' } },
};


const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Mock API call to simulate sending a message
        setTimeout(() => {
            setLoading(false);
            toast.success("Your message has been sent! We'll get back to you soon.");
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="page-container">
            <motion.div 
                className="contact-page-layout"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Info Panel */}
                <motion.div className="contact-info-panel" variants={itemVariants}>
                    <h2>Get in Touch</h2>
                    <p className="subtitle">
                        We're here to help and answer any question you might have. We look forward to hearing from you.
                    </p>

                    <ul className="contact-info-list">
                        <motion.li className="contact-info-item" variants={itemVariants}>
                            <div className="icon"><Mail size={20} /></div>
                            <div className="details">
                                <h4>Email Us</h4>
                                <p>contact@healthmate.app</p>
                            </div>
                        </motion.li>
                        <motion.li className="contact-info-item" variants={itemVariants}>
                            <div className="icon"><Phone size={20} /></div>
                            <div className="details">
                                <h4>Call Us</h4>
                                <p>+91 9350491254</p>
                            </div>
                        </motion.li>
                        <motion.li className="contact-info-item" variants={itemVariants}>
                            <div className="icon"><MapPin size={20} /></div>
                            <div className="details">
                                
                                
                            </div>
                        </motion.li>
                    </ul>

                    <div className="contact-socials">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="#" className="social-link"><Twitter size={18}/></a>
                            <a href="#" className="social-link"><Linkedin size={18}/></a>
                            <a href="#" className="social-link"><Github size={18}/></a>
                        </div>
                    </div>
                </motion.div>

                {/* Right Form Panel */}
                <motion.div className="contact-form-panel" variants={itemVariants}>
                     <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Your Name</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input id="name" name="name" type="text" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Your Email</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input id="email" name="email" type="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Your Message</label>
                            <textarea id="message" name="message" placeholder="How can we help you?" rows="6" required value={formData.message} onChange={handleChange}></textarea>
                        </div>
                        <Button type="submit" disabled={loading} style={{width: '100%'}}>
                            {loading ? 'Sending...' : 'Send Message'}
                            {!loading && <Send size={18} />}
                        </Button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ContactPage;
