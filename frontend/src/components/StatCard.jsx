import React from 'react';
import { motion } from 'framer-motion';

function StatCard({ icon, value, label }) {
  return (
    <motion.div
      className="card"
      whileHover={{ y: -5, boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.3)" }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--accent-primary)' }}>{icon}</div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{value}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
