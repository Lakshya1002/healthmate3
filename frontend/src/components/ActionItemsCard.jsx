// frontend/src/components/ActionItemsCard.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PackagePlus } from 'lucide-react';
import Button from './ui/Button';

const ActionItemsCard = ({ lowStockItems, onRefill }) => {
    if (!lowStockItems || lowStockItems.length === 0) {
        return null;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="card action-items-card"
        >
            <div className="action-items-header">
                <AlertTriangle />
                <h3>Action Required</h3>
            </div>
            <p>The following medications are running low and may need a refill soon.</p>
            <ul className="action-items-list">
                {lowStockItems.map(item => (
                    <li key={item.id} className="action-item">
                        <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">{item.quantity} left</span>
                        </div>
                        {/* ✅ FIXED: The onClick handler now passes the entire 'item' object. */}
                        {/* This ensures the RefillModal receives all the necessary medicine data. */}
                        <Button onClick={() => onRefill(item)} size="sm">
                            <PackagePlus size={16} />
                            Mark as Refilled
                        </Button>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default ActionItemsCard;
