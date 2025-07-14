// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { fetchMedicines, fetchMedicineStats, refillMedicine } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Loader from '../components/Loader';
import EditModal from '../components/EditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AiInfoModal from '../components/AiInfoModal';
import MedicineList from '../components/MedicineList';
import StatCard from '../components/StatCard';
import Button from '../components/ui/Button';
import ActionItemsCard from '../components/ActionItemsCard';
import RefillModal from '../components/RefillModal';

import { Pill, Check, Clock, Search, List, LayoutGrid, Plus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState({ totalMedicines: 0, activeMedicines: 0, completedMedicines: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('active');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const [editingMedicine, setEditingMedicine] = useState(null);
    const [deletingMedicine, setDeletingMedicine] = useState(null);
    const [infoMedicine, setInfoMedicine] = useState(null);
    const [refillingMedicine, setRefillingMedicine] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [medsRes, statsRes] = await Promise.all([
                fetchMedicines(),
                fetchMedicineStats(),
            ]);
            setMedicines(medsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const lowStockItems = useMemo(() => {
        return medicines.filter(med => med.quantity != null && med.refill_threshold != null && med.quantity <= med.refill_threshold);
    }, [medicines]);

    const filteredMedicines = useMemo(() => {
        if (activeTab === 'all') {
             return medicines.filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return medicines
            .filter(med => {
                if (activeTab === 'active') {
                    return !med.end_date || new Date(med.end_date) >= now;
                }
                return med.end_date && new Date(med.end_date) < now;
            })
            .filter(med =>
                med.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [medicines, activeTab, searchQuery]);

    const handleRefillConfirm = async (id, quantity) => {
        const promise = refillMedicine(id, quantity);
        toast.promise(promise, {
            loading: 'Refilling medicine...',
            success: 'Medicine has been marked as refilled!',
            error: 'Failed to refill medicine.',
        });
        try {
            await promise;
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (medicine) => setEditingMedicine(medicine);
    const handleDeleteRequest = (medicine) => setDeletingMedicine(medicine);
    const handleGetInfo = (medicine) => setInfoMedicine(medicine);

    const closeModal = () => {
        setEditingMedicine(null);
        setDeletingMedicine(null);
        setInfoMedicine(null);
        setRefillingMedicine(null);
    };
    
    const handleActionSuccess = () => {
        fetchData();
        closeModal();
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container">
            <div className="page-header dashboard-header-enhanced">
                <div>
                    <h1>Welcome, {user?.username}!</h1>
                    <p>Here’s your health summary.</p>
                </div>
                <Button onClick={() => navigate('/add')}>
                    <Plus size={20} />
                    Add Medicine
                </Button>
            </div>

            <AnimatePresence>
                <ActionItemsCard lowStockItems={lowStockItems} onRefill={(med) => setRefillingMedicine(med)} />
            </AnimatePresence>
            
            <div className="stat-cards-container">
                <StatCard icon={<Pill size={28} />} value={stats.activeMedicines || 0} label="Active" onClick={() => setActiveTab('active')} isActive={activeTab === 'active'} />
                <StatCard icon={<Check size={28} />} value={stats.totalMedicines || 0} label="All Medicines" onClick={() => setActiveTab('all')} isActive={activeTab === 'all'} />
                <StatCard icon={<Clock size={28} />} value={stats.completedMedicines || 0} label="Past" onClick={() => setActiveTab('past')} isActive={activeTab === 'past'} />
            </div>

            <div className="card">
                <div className="controls-header">
                    <div className="search-and-view">
                        <div className="search-bar">
                            <Search className="icon" size={18} />
                            <input type="text" placeholder="Search medicines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="view-toggle">
                            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={20} /></button>
                            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={20} /></button>
                        </div>
                    </div>
                </div>
                <MedicineList
                    medicines={filteredMedicines}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onGetInfo={handleGetInfo}
                />
            </div>

            <AnimatePresence>
                {editingMedicine && <EditModal isOpen={!!editingMedicine} onClose={closeModal} medicine={editingMedicine} onSuccess={handleActionSuccess} />}
                {deletingMedicine && <DeleteConfirmModal isOpen={!!deletingMedicine} onClose={closeModal} medicine={deletingMedicine} onSuccess={handleActionSuccess} />}
                {infoMedicine && <AiInfoModal medicineName={infoMedicine.name} onClose={closeModal} />}
                {refillingMedicine && (
                    <RefillModal 
                        isOpen={!!refillingMedicine} 
                        onClose={closeModal} 
                        medicine={refillingMedicine} 
                        onConfirm={handleRefillConfirm}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
