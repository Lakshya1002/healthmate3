// frontend/src/pages/EditReminderPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMedicines, fetchReminders, updateReminder } from '../api';
import ReminderForm from '../components/remindersForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const EditReminderPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [medicinesRes, remindersRes] = await Promise.all([
                fetchMedicines(),
                fetchReminders()
            ]);
            
            setMedicines(medicinesRes.data);

            const reminderToEdit = remindersRes.data.find(r => r.id.toString() === id);
            
            if (reminderToEdit) {
                setInitialData(reminderToEdit);
            } else {
                toast.error("Reminder not found.");
                navigate('/reminders');
            }
        } catch (error) {
            toast.error("Failed to load data for editing.");
            console.error("Failed to fetch data for editing", error);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSuccess = () => {
        navigate('/reminders');
    };

    const handleSave = async (formData) => {
        await updateReminder(id, formData);
    };

    if (isLoading || !initialData) {
        return <Loader />;
    }

    return (
        <div className="page-container" style={{ maxWidth: '900px' }}>
             <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant="secondary" onClick={() => navigate(-1)} style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1>Edit Reminder</h1>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Modify the details of your medication reminder.</p>
                </div>
            </div>
            <ReminderForm 
                medicines={medicines}
                onSave={handleSave}
                onSuccess={handleSuccess}
                onCancel={() => navigate('/reminders')}
                initialData={initialData}
                submitText="Save Changes"
            />
        </div>
    );
};

export default EditReminderPage;
