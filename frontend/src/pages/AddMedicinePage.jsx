import React from 'react';
import MedicineForm from '../components/MedicineForm';
import { Pill } from 'lucide-react';

const AddMedicinePage = ({ setActivePage }) => {
  return (
    <div>
      <div className="page-header">
        <h1><Pill size={36} style={{ marginRight: '1rem', color: 'var(--accent-primary)'}}/>Add New Medicine</h1>
        <p>Follow the steps below to add a new item to your regimen.</p>
      </div>
      <MedicineForm onMedicineAdded={() => {
        // After adding, navigate back to the dashboard to see the new entry
        setActivePage('dashboard');
      }} />
    </div>
  );
};

export default AddMedicinePage;
