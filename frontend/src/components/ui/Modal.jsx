// src/components/ui/Modal.jsx (NEW FILE)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content card"
            initial={{ scale: 0.9, y: -30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;