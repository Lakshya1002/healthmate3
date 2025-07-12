// frontend/src/pages/remindersPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Check, X, Trash2, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

import { fetchReminders, updateReminderStatus, deleteReminder, fetchMedicines } from '../api';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ReminderForm from '../components/remindersForm';
import '../remindersPage.css';

const ProgressChart = ({ value, total }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="progress-chart-container">
            <div className="progress-chart">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle className="progress-chart-bg" cx="50" cy="50" r="45" />
                    <motion.circle
                        className="progress-chart-fg"
                        cx="50"
                        cy="50"
                        r="45"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </svg>
                <div className="progress-chart-text">{Math.round(percentage)}%</div>
            </div>
            <div className="progress-details">
                <div className="stat"><span className="dot" style={{backgroundColor: 'var(--success-color)'}}></span> Taken: {value}</div>
                <div className="stat"><span className="dot" style={{backgroundColor: 'var(--text-secondary)'}}></span> Pending: {total - value}</div>
            </div>
        </div>
    );
};

const TimelineCard = ({ reminder, onUpdateStatus, onDelete }) => {
    const statusIcons = {
        scheduled: <Clock size={20} />,
        taken: <CheckCircle size={20} />,
        skipped: <XCircle size={20} />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`timeline-card status-${reminder.status}`}
        >
            <div className="icon-status">{statusIcons[reminder.status]}</div>
            <div className="details">
                <div className="medicine-name">{reminder.medicine_name}</div>
                <div className="status-text">{reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}</div>
            </div>
            <div className="actions">
                {reminder.status === 'scheduled' && (
                    <>
                        <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'taken')}><Check size={20} /></Button>
                        <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'skipped')}><X size={20} /></Button>
                    </>
                )}
                <Button variant="icon" className="delete" onClick={() => onDelete(reminder.id)}><Trash2 size={18} /></Button>
            </div>
        </motion.div>
    );
};


const RemindersPage = () => {
    const [reminders, setReminders] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [remindersRes, medicinesRes] = await Promise.all([fetchReminders(), fetchMedicines()]);
            const sortedReminders = remindersRes.data.sort((a,b) => a.reminder_time.localeCompare(b.reminder_time));
            setReminders(sortedReminders);
            setMedicines(medicinesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (id, status) => {
        const promise = updateReminderStatus(id, status);
        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated!',
            error: 'Failed to update status.',
        });
        try {
            await promise;
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        const promise = deleteReminder(id);
        toast.promise(promise, {
            loading: 'Deleting reminder...',
            success: 'Reminder deleted!',
            error: 'Failed to delete reminder.',
        });
        try {
            await promise;
            loadData();
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleAddSuccess = () => {
        setIsModalOpen(false);
        loadData();
    };

    const remindersByTime = useMemo(() => {
        return reminders.reduce((acc, reminder) => {
            const time = reminder.reminder_time.slice(0, 5);
            if (!acc[time]) {
                acc[time] = [];
            }
            acc[time].push(reminder);
            return acc;
        }, {});
    }, [reminders]);

    const totalReminders = reminders.length;
    const takenReminders = reminders.filter(r => r.status === 'taken').length;

    if (isLoading) return <Loader />;

    return (
        <div className="page-container">
            <div className="reminders-header-pro">
                <div className="header-content">
                    <h1>Your Daily Schedule</h1>
                    <p>A clear timeline of your medication for today. Stay on track and never miss a dose.</p>
                </div>
                <ProgressChart value={takenReminders} total={totalReminders} />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Add Reminder
                </Button>
            </div>

            {totalReminders > 0 ? (
                <div className="timeline-container">
                    <div className="timeline-line"></div>
                    <AnimatePresence>
                        {Object.entries(remindersByTime).map(([time, timeGroup], index) => (
                            <motion.div 
                                key={time} 
                                className="timeline-group"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="timeline-dot"></div>
                                <div className="timeline-time">{time}</div>
                                <div className="timeline-reminders">
                                    {timeGroup.map(r => (
                                        <TimelineCard key={r.id} reminder={r} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="reminders-empty-state">
                    <Bell size={48} className="icon"/>
                    <h3>No Reminders Scheduled</h3>
                    <p>It looks like you haven't set up any medication reminders yet. Get started by adding one.</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Add Your First Reminder
                    </Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Reminder">
                <ReminderForm medicines={medicines} onSuccess={handleAddSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default RemindersPage;
