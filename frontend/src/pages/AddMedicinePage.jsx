// frontend/src/pages/AddMedicinePage.jsx
import React from 'react';
import MultiStepForm from '../components/MultiStepForm'; // ✅ Import the new component

const AddMedicinePage = () => {
    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1>Add a New Medication</h1>
                <p style={{ maxWidth: '60ch', margin: '0.5rem auto 0' }}>
                    Let's add a new medication to your cabinet. Please provide the details in the steps below.
                </p>
            </div>
            <MultiStepForm />
        </div>
    );
};

export default AddMedicinePage;
