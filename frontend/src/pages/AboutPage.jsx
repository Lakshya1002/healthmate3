import React from 'react';
import StatCard from '../components/StatCard';
import { HeartPulse, Target, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
    return (
        <div>
            <div className="page-header">
                <h1>About HealthMate</h1>
                <p>Your simple, reliable, and private health companion.</p>
            </div>
            <div className="card static-page-card">
                <h2>Our Mission</h2>
                <p>
                    In a world of complex health challenges, managing medication shouldn't be one of them. 
                    HealthMate was born from a simple idea: to provide a straightforward, secure, and user-friendly tool 
                    to help individuals track their medication schedules without the clutter of unnecessary features.
                </p>
                <div className="stat-cards-container" style={{ marginTop: '2rem' }}>
                    <StatCard icon={<HeartPulse size={28}/>} value="Simplicity" label="At our core" />
                    <StatCard icon={<ShieldCheck size={28}/>} value="Security" label="Your data is yours" />
                    <StatCard icon={<Target size={28}/>} value="Focus" label="On what matters" />
                </div>
                <h2>The Developer</h2>
                <p>
                    HealthMate is a project by <strong>Lakshya Sabharwal</strong>, developed as part of an internship to demonstrate
                    full-stack development capabilities using modern technologies like React, Node.js, and MySQL. It represents a
                    passion for creating practical solutions to real-world problems.
                </p>
                <div className="team-member">
                    <img src="https://placehold.co/160x160/00c6ff/141e30?text=LS" alt="Lakshya Sabharwal"/>
                    <div className="team-member-info">
                        <h4>Lakshya Sabharwal</h4>
                        <p>Full-Stack Developer</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
