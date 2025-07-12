import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HeartPulse, Plus, Edit, Trash2, TrendingUp, BarChart, FileText, Activity } from 'lucide-react';

import { fetchHealthLogs, addHealthLog, updateHealthLog, deleteHealthLog } from '../api';
import Loader from '../components/Loader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import HealthLogForm from '../components/healthLogForm';
import HealthChart from '../components/healthChart';
import '../healthLog.css';

// --- Sub-component for a single log item in the history list ---
const LogItem = ({ log, onEdit, onDelete }) => (
  <motion.div 
    className="log-item-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    layout
  >
    <div className="log-item-date">
      <span className="month">{new Date(log.log_date).toLocaleString('default', { month: 'short' })}</span>
      <span className="day">{new Date(log.log_date).getDate()}</span>
    </div>
    <div className="log-item-details">
        <div className="log-item-vitals">
            <span>BP: <strong>{log.blood_pressure || 'N/A'}</strong></span>
            <span>HR: <strong>{log.heart_rate || 'N/A'}</strong> bpm</span>
            <span>Temp: <strong>{log.temperature || 'N/A'}</strong> °F</span>
            <span>Weight: <strong>{log.weight || 'N/A'}</strong> lbs</span>
        </div>
        {log.notes && <p className="log-item-notes">{log.notes}</p>}
    </div>
    <div className="log-item-actions">
      <Button variant="icon" onClick={() => onEdit(log)}><Edit size={18} /></Button>
      <Button variant="icon" className="delete" onClick={() => onDelete(log)}><Trash2 size={18} /></Button>
    </div>
  </motion.div>
);

// --- Sub-component for the "Latest Log" sidebar card ---
const LatestLogCard = ({ log }) => {
    if (!log) return null;

    return (
        <div className="latest-log-card">
            <div className="latest-log-header">
                <Activity size={20} />
                <h3>Latest Entry: {new Date(log.log_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
            </div>
            <div className="latest-log-vitals">
                <div className="vital-item">
                    <div className="value">{log.blood_pressure || '-'}</div>
                    <div className="label">Blood Pressure</div>
                </div>
                <div className="vital-item">
                    <div className="value">{log.heart_rate || '-'}</div>
                    <div className="label">Heart Rate</div>
                </div>
                <div className="vital-item">
                    <div className="value">{log.temperature || '-'}</div>
                    <div className="label">Temperature</div>
                </div>
                <div className="vital-item">
                    <div className="value">{log.weight || '-'}</div>
                    <div className="label">Weight</div>
                </div>
            </div>
            {log.notes && (
                <div className="latest-log-notes">
                    <h4>Notes</h4>
                    <p>{log.notes}</p>
                </div>
            )}
        </div>
    )
}

// --- Main Health Log Page Component ---
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
        return [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
    }, [logs]);

    // Prepare data for charts, including parsing Blood Pressure
    const chartData = useMemo(() => {
        return [...logs].map(log => {
            const [systolic, diastolic] = log.blood_pressure?.includes('/') ? log.blood_pressure.split('/').map(Number) : [null, null];
            return { ...log, systolic, diastolic };
        }).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
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

    const handleSubmit = async (formData) => {
        const promise = editingLog ? updateHealthLog(editingLog.id, formData) : addHealthLog(formData);
        try {
            await toast.promise(promise, {
                loading: 'Saving log...',
                success: `Health log ${editingLog ? 'updated' : 'added'}!`,
                error: 'Failed to save log.',
            });
            handleCloseModal();
            fetchLogs();
        } catch (error) { /* Toast handles error */ }
    };

    const handleDelete = async () => {
        if (!editingLog) return;
        try {
            await toast.promise(deleteHealthLog(editingLog.id), {
                loading: 'Deleting log...',
                success: 'Health log deleted!',
                error: 'Failed to delete log.',
            });
            handleCloseModal();
            fetchLogs();
        } catch (error) { /* Toast handles error */ }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="page-container">
            <div className="health-log-header">
                <h1><HeartPulse size={36}/>Health Logs</h1>
                <p>Track your daily vitals, monitor trends over time, and maintain a comprehensive record of your health journey.</p>
            </div>

            <div className="health-log-layout">
                <main>
                    {logs.length > 1 && (
                        <div className="charts-section">
                            <div className="charts-header">
                                <TrendingUp size={24} className="icon"/>
                                <h2>Your Health Trends</h2>
                            </div>
                            <div className="charts-grid">
                                <HealthChart 
                                    key="bp-chart" // Unique key added
                                    data={chartData}
                                    lines={[
                                        { dataKey: 'systolic', name: 'Systolic BP', color: '#8884d8'},
                                        { dataKey: 'diastolic', name: 'Diastolic BP', color: '#82ca9d'}
                                    ]}
                                />
                                <HealthChart 
                                    key="hr-chart" // Unique key added
                                    data={chartData}
                                    lines={[{ dataKey: 'heart_rate', name: 'Heart Rate (bpm)', color: '#ff7300'}]}
                                />
                                <HealthChart 
                                    key="weight-chart" // Unique key added
                                    data={chartData}
                                    lines={[{ dataKey: 'weight', name: 'Weight (lbs)', color: '#387908'}]}
                                />
                                 <HealthChart 
                                    key="temp-chart" // Unique key added
                                    data={chartData}
                                    lines={[{ dataKey: 'temperature', name: 'Temperature (°F)', color: '#ffc658'}]}
                                />
                            </div>
                        </div>
                    )}

                    <div className="log-history-section">
                        <div className="log-history-header">
                            <h2>Log History</h2>
                            <Button onClick={() => handleOpenModal()}>
                                <Plus size={20} />
                                Add New Log
                            </Button>
                        </div>
                        {logs.length > 0 ? (
                            <div className="health-log-list">
                                <AnimatePresence>
                                    {sortedLogs.map(log => (
                                        <LogItem key={log.id} log={log} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FileText size={48} style={{color: 'var(--text-secondary)', opacity: 0.5}}/>
                                <h3>No Logs Found</h3>
                                <p>Start tracking your health by adding your first log entry.</p>
                                <Button onClick={() => handleOpenModal()}>
                                    <Plus size={20} /> Add Your First Log
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
                <aside>
                    <LatestLogCard log={sortedLogs[0]} />
                </aside>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLog ? 'Edit Health Log' : 'Add New Health Log'}>
                <HealthLogForm 
                    onSubmit={handleSubmit}
                    initialData={editingLog || {}}
                    onCancel={handleCloseModal}
                    submitText={editingLog ? 'Save Changes' : 'Add Log'}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                <p>Are you sure you want to delete the log for <strong>{editingLog && new Date(editingLog.log_date).toLocaleDateString()}</strong>?</p>
                <div className="modal-actions" style={{justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

export default HealthLogPage;
