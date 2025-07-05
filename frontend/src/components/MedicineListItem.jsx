import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Pill, Calendar, StickyNote, Syringe, Tablets, Bot } from 'lucide-react';

const methodIcons = {
  pill: <Pill size={16}/>,
  tablet: <Tablets size={16}/>,
  syrup: <Bot size={16}/>,
  injection: <Syringe size={16}/>,
};

const MedicineListItem = ({ med, index, onEdit, onDelete }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <motion.li
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="medicine-item">
        <div className="medicine-info">
          <span className="name">{med.name}</span>
          <span className="detail">
            {methodIcons[med.method] || <Pill size={16}/>}
            {med.dosage || "N/A"} &bull; {med.method}
          </span>
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
        <div className="medicine-actions">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit} className="action-btn edit" aria-label="Edit">
            <Edit size={20} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="action-btn delete" aria-label="Delete">
            <Trash2 size={20} />
          </motion.button>
        </div>
      </div>
    </motion.li>
  );
};

export default MedicineListItem;
