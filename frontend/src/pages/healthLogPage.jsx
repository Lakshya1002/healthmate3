// frontend/src/pages/healthLogPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HeartPulse, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';

import { fetchHealthLogs, addHealthLog, updateHealthLog, deleteHealthLog } from '../api';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import HealthLogForm from '../components/healthLogForm';
import HealthChart from '../components/healthChart'; // ✅ Corrected Import

const HealthLogItem = ({ log, onEdit, onDelete }) => (
  <motion.div 
    className="health-log-item"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    layout
  >
    <div className="log-date">
      <span className="month">{new Date(log.log_date).toLocaleString('default', { month: 'short' })}</span>
      <span className="day">{new Date(log.log_date).getDate()}</span>
    </div>
    <div className="log-details">
      <span>BP: <strong>{log.blood_pressure || 'N/A'}</strong></span>
      <span>HR: <strong>{log.heart_rate || 'N/A'}</strong> bpm</span>
      <span>Temp: <strong>{log.temperature || 'N/A'}</strong> °F</span>
      <span>Weight: <strong>{log.weight || 'N/A'}</strong> lbs</span>
    </div>
    <div className="log-notes">
      {log.notes || <span className="placeholder">No notes for this day.</span>}
    </div>
    <div className="log-actions">
      <button onClick={() => onEdit(log)} className="action-btn edit"><Edit size={18} /></button>
      <button onClick={() => onDelete(log)} className="action-btn delete"><Trash2 size={18} /></button>
    </div>
  </motion.div>
);

const HealthLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchHealthLogs();
            setLogs(data);
        } catch (error) {
            toast.error('Could not fetch health logs.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
    }, [logs]);

    const handleOpenModal = (log = null) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingLog(null);
        setIsModalOpen(false);
    };

    const handleOpenDeleteModal = (log) => {
        setEditingLog(log);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setEditingLog(null);
        setIsDeleteModalOpen(false);
    };

    const handleSubmit = async (formData) => {
        const promise = editingLog
            ? updateHealthLog(editingLog.id, formData)
            : addHealthLog(formData);

        try {
            await toast.promise(promise, {
                loading: 'Saving log...',
                success: `Health log ${editingLog ? 'updated' : 'added'}!`,
                error: 'Failed to save log.',
            });
            handleCloseModal();
            fetchLogs();
        } catch (error) {
            // Toast will handle the error message
        }
    };

    const handleDelete = async () => {
        if (!editingLog) return;
        try {
            await toast.promise(deleteHealthLog(editingLog.id), {
                loading: 'Deleting log...',
                success: 'Health log deleted!',
                error: 'Failed to delete log.',
            });
            handleCloseDeleteModal();
            fetchLogs();
        } catch (error) {
            // Toast will handle the error message
        }
    };

    return (
        <div>
            <div className="page-header dashboard-header-enhanced">
                <div>
                    <h1><HeartPulse size={36} style={{ marginRight: '1rem', color: 'var(--accent-danger)'}}/>Health Logs</h1>
                    <p>Track your daily vitals and see your progress over time.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Add New Log
                </Button>
            </div>

            {logs.length > 1 && (
                <div className="charts-section card">
                    <div className="charts-header">
                        <TrendingUp size={24} />
                        <h2>Your Health Trends</h2>
                    </div>
                    <div className="charts-grid">
                        <HealthChart data={sortedLogs} dataKey="weight" name="Weight (lbs)" color="#8884d8" />
                        <HealthChart data={sortedLogs} dataKey="heart_rate" name="Heart Rate (bpm)" color="#82ca9d" />
                        <HealthChart data={sortedLogs} dataKey="temperature" name="Temperature (°F)" color="#ffc658" />
                    </div>
                </div>
            )}

            <div className="card">
                <h2>Log History</h2>
                {isLoading ? (
                    <Loader />
                ) : logs.length > 0 ? (
                    <div className="health-log-list">
                        <AnimatePresence>
                            {logs.sort((a,b) => new Date(b.log_date) - new Date(a.log_date)).map(log => (
                                <HealthLogItem key={log.id} log={log} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't logged any health data yet.</p>
                        <Button onClick={() => handleOpenModal()} style={{marginTop: '1rem'}}>
                            <Plus size={20} />
                            Add Your First Log
                        </Button>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLog ? 'Edit Health Log' : 'Add New Health Log'}>
                <HealthLogForm 
                    onSubmit={handleSubmit}
                    initialData={editingLog || {}}
                    onCancel={handleCloseModal}
                    submitText={editingLog ? 'Save Changes' : 'Add Log'}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirm Deletion">
                <p>Are you sure you want to delete the log for <strong>{editingLog && new Date(editingLog.log_date).toLocaleDateString()}</strong>?</p>
                <div className="modal-actions">
                    <Button onClick={handleCloseDeleteModal} variant="secondary">Cancel</Button>
                    <Button onClick={handleDelete} variant="danger">Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

export default HealthLogPage;
