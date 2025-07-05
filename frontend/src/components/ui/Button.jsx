// src/components/ui/Button.jsx (NEW FILE)
import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', disabled = false, type = 'button' }) => {
  const baseClasses = "btn";
  const variantClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    secondary: '', // Add more variants if needed
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export default Button;