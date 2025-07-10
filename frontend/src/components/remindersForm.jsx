// frontend/src/components/remindersForm.jsx

import React, { useState } from 'react';
import { addReminder } from '../api';
import toast from 'react-hot-toast';
import Button from './ui/Button';

const ReminderForm = ({ medicines, onSuccess, onCancel }) => {
    const [medicineId, setMedicineId] = useState('');
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!medicineId || !time) {
            toast.error("Please select a medicine and a time.");
            return;
        }
        setIsLoading(true);

        const promise = addReminder({ medicine_id: medicineId, reminder_time: time });
        toast.promise(promise, {
            loading: 'Adding reminder...',
            success: 'Reminder added successfully!',
            error: 'Failed to add reminder.'
        });

        try {
            await promise;
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="medicine">Medicine</label>
                <select id="medicine" value={medicineId} onChange={e => setMedicineId(e.target.value)} required>
                    <option value="" disabled>Select a medicine</option>
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="time">Time</label>
                <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
            <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Reminder'}</Button>
            </div>
        </form>
    );
};

export default ReminderForm; // ✅ FIXED: Export name matches component name
