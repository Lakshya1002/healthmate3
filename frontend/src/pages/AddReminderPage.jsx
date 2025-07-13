// frontend/src/pages/AddReminderPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMedicines, addReminder, fetchReminders } from '../api';
import ReminderForm from '../components/remindersForm';
import Loader from '../components/Loader';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const AddReminderPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        try {
            const [medicinesRes, remindersRes] = await Promise.all([
                fetchMedicines(),
                fetchReminders()
            ]);
            setMedicines(medicinesRes.data);
            setReminders(remindersRes.data);
        } catch (error) {
            console.error("Failed to fetch data for reminder form", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSuccess = () => {
        navigate('/reminders');
    };

    const handleSave = async (formData) => {
        await addReminder(formData);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container" style={{ maxWidth: '900px' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="secondary" onClick={() => navigate(-1)} style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1>Set a New Reminder</h1>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Create a schedule for your medication to ensure you never miss a dose.</p>
                </div>
            </div>
            <ReminderForm 
                medicines={medicines}
                reminders={reminders}
                onSave={handleSave}
                onSuccess={handleSuccess}
                onCancel={() => navigate('/reminders')}
                submitText="Add Reminder"
            />
        </div>
    );
};

export default AddReminderPage;
