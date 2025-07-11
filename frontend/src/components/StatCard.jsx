// frontend/src/components/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

function StatCard({ icon, value, label, onClick, isActive }) {
  const cardClasses = `card stat-card ${onClick ? 'clickable' : ''} ${isActive ? 'active' : ''}`;

  return (
    <motion.div
      className={cardClasses}
      whileHover={onClick ? { y: -5, boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.1)" } : {}}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="stat-icon" style={{ color: 'var(--primary-color)' }}>{icon}</div>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
