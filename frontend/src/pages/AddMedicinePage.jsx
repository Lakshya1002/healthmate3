// frontend/src/pages/AddMedicinePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { addMedicine } from '../api'; // Correct: Use named import
import MedicineForm from '../components/MedicineForm';

const AddMedicinePage = () => {
    const navigate = useNavigate();

    const handleAdd = async (formData) => {
        await addMedicine(formData);
        navigate('/dashboard'); // Navigate to dashboard, which will re-fetch data
    };

    return (
        <div className="container">
            <div className="auth-container" style={{marginTop: '40px'}}>
                <h2>Add New Medicine</h2>
                <MedicineForm 
                    onSubmit={handleAdd} 
                    onCancel={() => navigate('/dashboard')} 
                    submitText="Add Medicine" 
                />
            </div>
        </div>
    );
};

export default AddMedicinePage;
