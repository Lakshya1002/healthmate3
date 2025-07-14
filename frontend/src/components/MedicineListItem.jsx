// frontend/src/components/MedicineListItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Pill, Calendar, StickyNote, Syringe, Tablets, Bot, AlertTriangle, Sparkles, Repeat, Package } from 'lucide-react';

const methodIcons = {
  pill: { icon: <Pill />, color: '#3b82f6' },
  tablet: { icon: <Tablets />, color: '#8b5cf6' },
  syrup: { icon: <Bot />, color: '#10b981' },
  injection: { icon: <Syringe />, color: '#ef4444' },
};

const MedicineListItem = ({ med, index, onEdit, onDelete, onGetInfo }) => {
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05 },
        }),
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
    };

    // ✅ ADDED: Logic to check if the medicine stock is low.
    const isLowStock = med.quantity != null && med.refill_threshold != null && med.quantity <= med.refill_threshold;
    const { icon, color } = methodIcons[med.method] || { icon: <Pill />, color: '#64748b' };

    return (
        <motion.li
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            // ✅ ADDED: Conditional class for styling the low-stock state.
            className={`medicine-item-redesigned ${isLowStock ? 'low-stock' : ''}`}
        >
            <div className="med-icon-container" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="med-main-info">
                <span className="name">{med.name}</span>
                <span className="dosage">{med.dosage || "N/A"}</span>
            </div>
            <div className="med-details-grid">
                <div className="detail-item">
                    <Repeat size={14} />
                    <span>{med.frequency || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <Calendar size={14} />
                    <span>{med.start_date?.slice(0, 10) || 'N/A'} to {med.end_date?.slice(0, 10) || 'Ongoing'}</span>
                </div>
                {med.quantity != null && (
                     // ✅ ADDED: Conditional warning class and icon for low stock.
                    <div className={`detail-item ${isLowStock ? 'warning' : ''}`}>
                        {isLowStock ? <AlertTriangle size={14} /> : <Package size={14} />}
                        <span>{med.quantity} left</span>
                    </div>
                )}
                {med.notes && (
                    <div className="detail-item notes">
                        <StickyNote size={14} />
                        <span>{med.notes}</span>
                    </div>
                )}
            </div>
            <div className="medicine-actions">
                <motion.button whileTap={{ scale: 0.9 }} onClick={onGetInfo} className="action-btn ai" aria-label="Get AI Info">
                    <Sparkles size={18} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit} className="action-btn edit" aria-label="Edit">
                    <Edit size={18} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="action-btn delete" aria-label="Delete">
                    <Trash2 size={18} />
                </motion.button>
            </div>
        </motion.li>
    );
};

export default MedicineListItem;
