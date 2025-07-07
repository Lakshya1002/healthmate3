// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { fetchMedicines, fetchMedicineStats } from '../api';
import Loader from '../components/Loader';
import EditModal from '../components/EditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const StatCard = ({ title, value }) => (
    <div className="stat-card">
        <h3>{title}</h3>
        <p>{value}</p>
    </div>
);

const MedicineCard = ({ medicine, onEdit, onDelete }) => (
    <div className="medicine-card">
        <div>
            <h4 className="medicine-card-header">{medicine.name}</h4>
            <p className="medicine-card-details">
                <strong>Dosage:</strong> {medicine.dosage} <br/>
                <strong>Frequency:</strong> {medicine.frequency}
            </p>
        </div>
        <div className="medicine-card-actions">
            <button onClick={() => onEdit(medicine)} className="btn btn-secondary">Edit</button>
            <button onClick={() => onDelete(medicine)} className="btn btn-danger">Delete</button>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState({ totalMedicines: 0, activeMedicines: 0, completedMedicines: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [medsResponse, statsResponse] = await Promise.all([
                fetchMedicines(),
                fetchMedicineStats()
            ]);
            setMedicines(medsResponse.data);
            setStats(statsResponse.data);
        } catch (err) {
            setError('Failed to fetch your health data. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (medicine) => {
        setSelectedMedicine(medicine);
        setEditModalOpen(true);
    };

    const handleDelete = (medicine) => {
        setSelectedMedicine(medicine);
        setDeleteModalOpen(true);
    };

    const closeModal = () => {
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setSelectedMedicine(null);
    };

    const onActionSuccess = () => {
        fetchData(); // Refetch data after action
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1>Welcome, {user?.username}!</h1>
                <button onClick={() => navigate('/add-medicine')} className="btn btn-primary">
                    Add New Medicine
                </button>
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <div className="stat-cards">
                <StatCard title="Total Medicines" value={stats.totalMedicines} />
                <StatCard title="Active Medicines" value={stats.activeMedicines} />
                <StatCard title="Completed" value={stats.completedMedicines} />
            </div>

            <div className="medicines-container">
                <h2>Your Medications</h2>
                {medicines.length > 0 ? (
                    <div className="medicine-grid">
                        {medicines.map(med => (
                            <MedicineCard key={med.id} medicine={med} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <p>You haven't added any medicines yet. Click the button above to get started!</p>
                )}
            </div>

            {isEditModalOpen && selectedMedicine && (
                <EditModal 
                    isOpen={isEditModalOpen} 
                    onClose={closeModal} 
                    medicine={selectedMedicine}
                    onSuccess={onActionSuccess}
                />
            )}
            {isDeleteModalOpen && selectedMedicine && (
                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeModal}
                    medicine={selectedMedicine}
                    onSuccess={onActionSuccess}
                />
            )}
        </div>
    );
};

export default Dashboard;
