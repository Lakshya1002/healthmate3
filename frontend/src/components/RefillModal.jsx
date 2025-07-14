// frontend/src/components/RefillModal.jsx
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { PackagePlus, Pill } from 'lucide-react';

const RefillModal = ({ medicine, isOpen, onClose, onConfirm }) => {
    const [newQuantity, setNewQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newQuantity || isNaN(newQuantity) || newQuantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }
        setLoading(true);
        await onConfirm(medicine.id, parseInt(newQuantity, 10));
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Refill ${medicine.name}`}>
            <form onSubmit={handleSubmit}>
                <div className="refill-info">
                    <div className="info-item">
                        <span>Current Quantity</span>
                        <strong>{medicine.quantity}</strong>
                    </div>
                    <div className="info-item">
                        <span>Refill Threshold</span>
                        <strong>{medicine.refill_threshold}</strong>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="newQuantity">New Total Quantity</label>
                    <p className="form-help-text">
                        Enter the new total quantity for this medicine after refilling.
                    </p>
                    <div className="input-with-icon">
                        <Pill size={18} />
                        <input
                            id="newQuantity"
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            placeholder="e.g., 90"
                            autoFocus
                            required
                        />
                    </div>
                </div>
                <div className="modal-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Confirm Refill'}
                        {!loading && <PackagePlus size={16} />}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default RefillModal;
