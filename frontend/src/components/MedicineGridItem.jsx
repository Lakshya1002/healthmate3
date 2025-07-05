import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Pill, Calendar, StickyNote, Syringe, Tablets, Bot } from 'lucide-react';

const methodIcons = {
  pill: <Pill size={20}/>,
  tablet: <Tablets size={20}/>,
  syrup: <Bot size={20}/>,
  injection: <Syringe size={20}/>,
};

const MedicineGridItem = ({ med, index, onEdit, onDelete }) => {
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { delay: i * 0.05 },
        }),
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    return (
        <motion.div
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
        >
            <div className="medicine-grid-item">
                <div className="grid-item-header">
                    <div className="name">{med.name}</div>
                    <div style={{color: 'var(--accent-primary)'}}>
                        {methodIcons[med.method] || <Pill size={20}/>}
                    </div>
                </div>
                <div className="grid-item-body">
                     <span className="detail">{med.dosage || "N/A"} &bull; {med.method}</span>
                    <span className="detail">
                        <Calendar size={16}/>
                        {med.start_date?.slice(0, 10) || 'N/A'} to {med.end_date?.slice(0, 10) || 'Ongoing'}
                    </span>
                    {med.notes && (
                        <span className="detail">
                            <StickyNote size={16}/>
                            {med.notes}
                        </span>
                    )}
                </div>
                <div className="grid-item-footer">
                    <div className="medicine-actions">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit} className="action-btn edit" aria-label="Edit">
                            <Edit size={20} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="action-btn delete" aria-label="Delete">
                            <Trash2 size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MedicineGridItem;
