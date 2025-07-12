// frontend/src/pages/AddReminderPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMedicines } from '../api';
import ReminderForm from '../components/remindersForm';
import Loader from '../components/Loader';

const AddReminderPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadMedicines = useCallback(async () => {
        try {
            const { data } = await fetchMedicines();
            setMedicines(data);
        } catch (error) {
            console.error("Failed to fetch medicines for reminder form", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMedicines();
    }, [loadMedicines]);

    const handleSuccess = () => {
        navigate('/reminders'); // Navigate back to the reminders list on success
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1>Set a New Reminder</h1>
                <p style={{ maxWidth: '60ch', margin: '0.5rem auto 0' }}>
                    Create a schedule for your medication to ensure you never miss a dose.
                </p>
            </div>
            <div className="card">
                <ReminderForm 
                    medicines={medicines}
                    onSuccess={handleSuccess}
                    onCancel={() => navigate('/reminders')}
                />
            </div>
        </div>
    );
};

export default AddReminderPage;
