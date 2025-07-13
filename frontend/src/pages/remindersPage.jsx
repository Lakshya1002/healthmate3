// frontend/src/pages/remindersPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Check, X, Trash2, Plus, Clock, CheckCircle, XCircle, Edit, CalendarDays, Repeat, Hash } from 'lucide-react';

import { fetchReminders, updateReminder, deleteReminder } from '../api';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import '../remindersPage.css';

// A card to highlight the very next upcoming dose.
const UpcomingDoseCard = ({ reminder, onUpdateStatus }) => {
    if (!reminder) {
        return (
            <div className="upcoming-dose-card empty">
                <CheckCircle size={24} className="icon" />
                <h4>All Done for Today!</h4>
                <p>You've taken or skipped all your scheduled doses.</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="upcoming-dose-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="header">
                <Clock size={18} />
                <h4>Next Dose</h4>
            </div>
            <div className="content">
                <span className="time">{reminder.reminder_time.slice(0, 5)}</span>
                <span className="name">{reminder.medicine_name}</span>
            </div>
            <div className="actions">
                <Button onClick={() => onUpdateStatus(reminder.id, 'taken')} size="sm">
                    <Check size={16} /> Mark as Taken
                </Button>
                 <Button onClick={() => onUpdateStatus(reminder.id, 'skipped')} variant="secondary" size="sm">
                    <X size={16} /> Skip
                </Button>
            </div>
        </motion.div>
    )
}


// A card representing a single reminder in the timeline.
const TimelineCard = ({ reminder, onUpdateStatus, onDelete, onEdit }) => {
    const statusIcons = {
        scheduled: <Clock size={20} />,
        taken: <CheckCircle size={20} />,
        skipped: <XCircle size={20} />,
    };

    const getFrequencyText = () => {
        switch (reminder.frequency) {
            case 'weekly':
                return <><CalendarDays size={14}/><span>{reminder.week_days.split(',').map(d => d.slice(0,3)).join(', ')}</span></>;
            case 'interval':
                return <><Hash size={14}/><span>Every {reminder.day_interval} days</span></>;
            case 'daily':
            default:
                return <><Repeat size={14}/><span>Everyday</span></>;
        }
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
            <div className="frequency">
                {getFrequencyText()}
            </div>
            <div className="actions">
                <Button variant="icon" onClick={() => onEdit(reminder.id)}><Edit size={18} /></Button>
                {reminder.status === 'scheduled' && (
                    <>
                        <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'taken')}><Check size={20} /></Button>
                        <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'skipped')}><X size={20} /></Button>
                    </>
                )}
                <Button variant="icon" className="delete" onClick={() => onDelete(reminder)}><Trash2 size={18} /></Button>
            </div>
        </motion.div>
    );
};


const RemindersPage = () => {
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const remindersRes = await fetchReminders();
            const sortedReminders = remindersRes.data.sort((a,b) => a.reminder_time.localeCompare(b.reminder_time));
            setReminders(sortedReminders);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load reminders.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateStatus = async (id, status) => {
        const promise = updateReminder(id, { status });
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

    const handleConfirmDelete = async (id) => {
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

    // ✅ UPDATED: This now triggers a confirmation toast instead of a modal.
    const handleDeleteRequest = (reminder) => {
        toast((t) => (
            <div className="delete-toast">
                <h4>Delete Reminder?</h4>
                <p>Are you sure you want to delete the reminder for <strong>{reminder.medicine_name}</strong>?</p>
                <div className="toast-actions">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => {
                        handleConfirmDelete(reminder.id);
                        toast.dismiss(t.id);
                    }}>
                        Delete
                    </Button>
                </div>
            </div>
        ), {
            duration: 6000,
            style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
            }
        });
    };
    
    const handleAddClick = () => {
        navigate('/reminders/add');
    };

    const handleEditClick = (id) => {
        navigate(`/reminders/edit/${id}`);
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

    const nextUpcomingReminder = useMemo(() => {
        return reminders
            .filter(r => r.status === 'scheduled')
            .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))[0];
    }, [reminders]);


    if (isLoading) return <Loader />;

    return (
        <div className="page-container">
            <div className="reminders-header-pro">
                <div className="header-content">
                    <h1>Your Daily Schedule</h1>
                    <p>A clear timeline of your medication for today. Stay on track and never miss a dose.</p>
                </div>
                <UpcomingDoseCard reminder={nextUpcomingReminder} onUpdateStatus={handleUpdateStatus} />
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Today's Timeline</h3>
                    <Button onClick={handleAddClick}>
                        <Plus size={20} />
                        Add Reminder
                    </Button>
                </div>

                {reminders.length > 0 ? (
                    <div className="timeline-container">
                        <div className="timeline-line"></div>
                        <AnimatePresence>
                            {Object.entries(remindersByTime).map(([time, timeGroup], groupIndex) => (
                                <motion.div 
                                    key={time} 
                                    className="timeline-group"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: groupIndex * 0.1 }}
                                >
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-time">{time}</div>
                                    <div className="timeline-reminders">
                                        {timeGroup.map(r => (
                                            <TimelineCard 
                                                key={r.id} 
                                                reminder={r} 
                                                onUpdateStatus={handleUpdateStatus} 
                                                onDelete={handleDeleteRequest} 
                                                onEdit={handleEditClick} 
                                            />
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemindersPage;
