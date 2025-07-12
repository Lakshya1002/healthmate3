// frontend/src/components/TodaysDoses.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from './ui/Button';

const DoseItem = ({ dose, onRecordDose }) => {
    const statusInfo = {
        pending: { icon: <Clock size={20} />, text: 'Pending' },
        taken: { icon: <CheckCircle size={20} />, text: 'Taken' },
        skipped: { icon: <XCircle size={20} />, text: 'Skipped' },
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`dose-item status-${dose.status}`}
        >
            <div className="dose-status-icon">{statusInfo[dose.status].icon}</div>
            <div className="dose-details">
                <span className="dose-time">{dose.time.slice(0, 5)}</span>
                <span className="dose-medicine-name">{dose.medicine_name}</span>
            </div>
            <div className="dose-actions">
                {dose.status === 'pending' && (
                    <>
                        <Button onClick={() => onRecordDose(dose.reminder_id, 'taken')} size="sm"><Check size={16}/></Button>
                        <Button onClick={() => onRecordDose(dose.reminder_id, 'skipped')} variant="secondary" size="sm"><X size={16}/></Button>
                    </>
                )}
            </div>
        </motion.div>
    );
};


const TodaysDoses = ({ timeline, onRecordDose }) => {
    if (!timeline || timeline.length === 0) {
        return (
            <div className="card">
                <h3>Today's Doses</h3>
                <div className="empty-state-text">No doses scheduled for today.</div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Today's Doses</h3>
            <div className="dose-list">
                {timeline.map(dose => (
                    <DoseItem 
                        key={dose.reminder_id + dose.time} 
                        dose={dose}
                        onRecordDose={onRecordDose}
                    />
                ))}
            </div>
        </div>
    );
};

export default TodaysDoses;