// frontend/src/components/MedicineGridItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Pill, Calendar, StickyNote, Syringe, Tablets, Bot, AlertTriangle, Sparkles, Repeat, Package } from 'lucide-react';

const methodIcons = {
  pill: { icon: <Pill />, color: '#3b82f6' },
  tablet: { icon: <Tablets />, color: '#8b5cf6' },
  syrup: { icon: <Bot />, color: '#10b981' },
  injection: { icon: <Syringe />, color: '#ef4444' },
};

const MedicineGridItem = ({ med, index, onEdit, onDelete, onGetInfo }) => {
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { delay: i * 0.05 },
        }),
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    const isLowStock = med.quantity != null && med.refill_threshold != null && med.quantity <= med.refill_threshold;
    const { icon, color } = methodIcons[med.method] || { icon: <Pill />, color: '#64748b' };

    return (
        <motion.div
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className={`medicine-grid-item-redesigned ${isLowStock ? 'low-stock' : ''}`}
        >
            <div className="grid-item-header">
                <div className="med-icon-container" style={{ backgroundColor: color }}>
                    {icon}
                </div>
                <div className="med-main-info">
                    <span className="name">{med.name}</span>
                    <span className="dosage">{med.dosage || "N/A"}</span>
                </div>
            </div>
            <div className="grid-item-body">
                <div className="detail-item">
                    <Repeat size={14} />
                    <span>{med.frequency || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <Calendar size={14} />
                    <span>{med.start_date?.slice(0, 10) || 'N/A'} to {med.end_date?.slice(0, 10) || 'Ongoing'}</span>
                </div>
                 {med.quantity != null && (
                    <div className={`detail-item ${isLowStock ? 'warning' : ''}`}>
                        <Package size={14} />
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
            <div className="grid-item-footer">
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
        </motion.div>
    );
};

export default MedicineGridItem;
