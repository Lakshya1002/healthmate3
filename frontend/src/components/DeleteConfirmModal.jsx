// frontend/src/components/DeleteConfirmModal.jsx
import React, { useState } from 'react';
import { deleteMedicine } from '../api';
// Corrected Path: Point to the 'ui' subdirectory
import Modal from './ui/Modal';

const DeleteConfirmModal = ({ isOpen, onClose, medicine, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        try {
            await deleteMedicine(medicine.id);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete medicine.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
            {error && <p className="error-message">{error}</p>}
            <p>Are you sure you want to delete the medicine: <strong>{medicine.name}</strong>?</p>
            <div className="modal-actions">
                <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button onClick={handleDelete} className="btn btn-danger" disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmModal;
