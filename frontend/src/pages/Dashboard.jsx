// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { fetchMedicines, fetchMedicineStats, fetchReminders, updateReminderStatus } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Loader from '../components/Loader';
import EditModal from '../components/EditModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AiInfoModal from '../components/AiInfoModal';
import MedicineList from '../components/MedicineList';
import StatCard from '../components/StatCard';
import Button from '../components/ui/Button';

import { Pill, Check, Clock, Search, List, LayoutGrid, Plus, Bell, XCircle, CheckCircle } from 'lucide-react';

const TodayScheduleItem = ({ reminder, onUpdateStatus }) => (
    <div className={`today-schedule-item status-${reminder.status}`}>
        <div className="time">{reminder.reminder_time.slice(0, 5)}</div>
        <div className="details">
            <span className="medicine-name">{reminder.medicine_name}</span>
            <span className="status">
                {reminder.status === 'taken' && <CheckCircle size={14} />}
                {reminder.status === 'skipped' && <XCircle size={14} />}
                Status: {reminder.status}
            </span>
        </div>
        {reminder.status === 'scheduled' && (
            <div className="actions">
                <Button onClick={() => onUpdateStatus(reminder.id, 'taken')} size="sm">Take</Button>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState({ totalMedicines: 0, activeMedicines: 0, completedMedicines: 0 });
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('active');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const [editingMedicine, setEditingMedicine] = useState(null);
    const [deletingMedicine, setDeletingMedicine] = useState(null);
    const [infoMedicine, setInfoMedicine] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [medsRes, statsRes, remindersRes] = await Promise.all([
                fetchMedicines(),
                fetchMedicineStats(),
                fetchReminders()
            ]);
            setMedicines(medsRes.data);
            setStats(statsRes.data);
            setReminders(remindersRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                return med.end_date && new Date(med.end_date) < now; // 'past'
            })
            .filter(med =>
                med.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [medicines, activeTab, searchQuery]);

    const todaysReminders = useMemo(() => {
        return reminders.sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
    }, [reminders]);
    
    const handleUpdateReminderStatus = async (id, status) => {
        const promise = updateReminderStatus(id, status);
        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated!',
            error: 'Failed to update status.',
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
    };

    const handleConfirmDelete = async () => {
        if (!deletingMedicine) return;
        // ... (delete logic remains the same)
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
                    <p>Here’s your health summary for today.</p>
                </div>
                <Button onClick={() => navigate('/add')}>
                    <Plus size={20} />
                    Add Medicine
                </Button>
            </div>
            
            <div className="stat-cards-container">
                <StatCard icon={<Pill size={28} />} value={stats.activeMedicines || 0} label="Active" onClick={() => setActiveTab('active')} isActive={activeTab === 'active'} />
                <StatCard icon={<Check size={28} />} value={stats.totalMedicines || 0} label="All Medicines" onClick={() => setActiveTab('all')} isActive={activeTab === 'all'} />
                <StatCard icon={<Clock size={28} />} value={stats.completedMedicines || 0} label="Past" onClick={() => setActiveTab('past')} isActive={activeTab === 'past'} />
            </div>

            <div className="dashboard-grid">
                <div className="main-content">
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
                </div>
                
                <aside className="sidebar-content">
                    <div className="card">
                        <div className="sidebar-header">
                            <Bell size={20} />
                            <h2>Today's Schedule</h2>
                        </div>
                        <div className="today-schedule-list">
                            {todaysReminders.length > 0 ? (
                                todaysReminders.map(r => (
                                    <TodayScheduleItem key={r.id} reminder={r} onUpdateStatus={handleUpdateReminderStatus} />
                                ))
                            ) : (
                                <p className="empty-state-text">No reminders scheduled for today.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {editingMedicine && <EditModal isOpen={!!editingMedicine} onClose={closeModal} medicine={editingMedicine} onSuccess={handleActionSuccess} />}
                {deletingMedicine && <DeleteConfirmModal isOpen={!!deletingMedicine} onClose={closeModal} onConfirm={handleConfirmDelete} medicineName={deletingMedicine.name} />}
                {infoMedicine && <AiInfoModal medicineName={infoMedicine.name} onClose={closeModal} />}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
