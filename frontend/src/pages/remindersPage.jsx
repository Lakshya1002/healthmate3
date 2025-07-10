// frontend/src/pages/RemindersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { fetchReminders, updateReminderStatus, deleteReminder, fetchMedicines } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Check, X, Trash2, Plus } from 'lucide-react';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ReminderForm from '../components/remindersForm.jsx'; // ✅ FIXED: Path and name now match your file exactly

const ReminderItem = ({ reminder, onUpdateStatus, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className={`reminder-item status-${reminder.status}`}
    >
        <div className="reminder-info">
            <Bell size={20} />
            <div>
                <span className="medicine-name">{reminder.medicine_name}</span>
                <span className="time">{reminder.reminder_time.slice(0, 5)}</span>
            </div>
        </div>
        <div className="reminder-actions">
            {reminder.status === 'scheduled' && (
                <>
                    <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'taken')}><Check size={20} /></Button>
                    <Button variant="icon" onClick={() => onUpdateStatus(reminder.id, 'skipped')}><X size={20} /></Button>
                </>
            )}
            <Button variant="icon" className="delete" onClick={() => onDelete(reminder.id)}><Trash2 size={20} /></Button>
        </div>
    </motion.div>
);

const RemindersPage = () => {
    const [reminders, setReminders] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [remindersRes, medicinesRes] = await Promise.all([fetchReminders(), fetchMedicines()]);
            setReminders(remindersRes.data);
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
    }

    if (isLoading) return <Loader />;

    return (
        <div className="page-container">
            <div className="page-header dashboard-header-enhanced">
                <div>
                    <h1><Bell size={36} style={{ marginRight: '1rem' }}/>Your Reminders</h1>
                    <p>Manage your medication schedule for today.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Add Reminder
                </Button>
            </div>

            <div className="card">
                <div className="reminder-list">
                    <AnimatePresence>
                        {reminders.length > 0 ? (
                            reminders.map(r => <ReminderItem key={r.id} reminder={r} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />)
                        ) : (
                            <p>No reminders scheduled.</p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Reminder">
                <ReminderForm medicines={medicines} onSuccess={handleAddSuccess} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default RemindersPage; // ✅ FIXED: Export name matches component name
