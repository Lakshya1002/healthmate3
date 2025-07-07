// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authContext';
import * as api from '../api';
import toast from 'react-hot-toast';

// --- Component Imports ---
import Loader from '../components/Loader';
import EditModal from '../components/EditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import MedicineForm from '../components/MedicineForm';
import MedicineList from '../components/MedicineList';

// --- Icon Imports ---
import { Pill, CheckSquare, Clock } from 'lucide-react';

const StatCard = ({ icon, title, value }) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setX(e.clientX - rect.left);
        setY(e.clientY - rect.top);
    };

    return (
        <motion.div
            className="card stat-card"
            onMouseMove={handleMouseMove}
            style={{ '--x': `${x}px`, '--y': `${y}px` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {icon}
            <div>
                <h3>{title}</h3>
                <p>{value}</p>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.fetchMedicines();
            setMedicines(data);
        } catch (err) {
            setError('Failed to fetch your health data. Please try refreshing the page.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const activeMeds = medicines.filter(med => !med.end_date || new Date(med.end_date) >= now);
        return {
            active: activeMeds.length,
            completed: medicines.length - activeMeds.length,
        };
    }, [medicines]);

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
        fetchData();
        closeModal();
    };

    const handleMedicineAdded = () => {
        toast.success("Medicine added successfully!");
        fetchData();
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="page-header">
                <h1>Welcome, {user?.username}!</h1>
                <p>Your personal health dashboard. Add, view, and manage your medications all in one place.</p>
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <div className="stat-cards-container">
                <StatCard icon={<Pill size={24} />} title="Active Medicines" value={stats.active} />
                <StatCard icon={<CheckSquare size={24} />} title="Completed Regimens" value={stats.completed} />
                <StatCard icon={<Clock size={24} />} title="Total Recorded" value={medicines.length} />
            </div>

            <div className="dashboard-grid">
                <motion.div layout className="form-container card">
                    <h2>Add a New Medicine</h2>
                    <MedicineForm onMedicineAdded={handleMedicineAdded} />
                </motion.div>
                <motion.div layout className="list-container">
                    <MedicineList 
                        medicines={medicines} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </motion.div>
            </div>

            <AnimatePresence>
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
            </AnimatePresence>
        </>
    );
};

export default Dashboard;
