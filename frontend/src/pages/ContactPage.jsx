import React from 'react';
import Button from '../components/ui/Button';

const ContactPage = () => {
    return (
        <div>
            <div className="page-header">
                <h1>Get In Touch</h1>
                <p>Have questions, feedback, or suggestions? We'd love to hear from you.</p>
            </div>
             <div className="card static-page-card contact-form">
                <h2>Contact Form</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <input type="text" placeholder="Your Name" />
                    </div>
                     <div className="input-group">
                        <input type="email" placeholder="Your Email" />
                    </div>
                     <div className="input-group">
                        <textarea placeholder="Your Message" rows="5"></textarea>
                    </div>
                    <Button type="submit">Send Message</Button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;
