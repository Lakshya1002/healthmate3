// frontend/src/components/MedicineForm.jsx
import React, { useState } from 'react';

const MedicineForm = ({ onSubmit, initialData = {}, onCancel, submitText = 'Submit' }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        dosage: initialData.dosage || '',
        frequency: initialData.frequency || '',
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
        notes: initialData.notes || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label>Medicine Name</label>
                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
                <label>Dosage (e.g., 500mg)</label>
                <input type="text" name="dosage" value={formData.dosage} onChange={(e) => setFormData({...formData, dosage: e.target.value})} required />
            </div>
            <div className="form-group">
                <label>Frequency (e.g., Twice a day)</label>
                <input type="text" name="frequency" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} required />
            </div>
            <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
            </div>
            <div className="form-group">
                <label>End Date (Optional)</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
            <div className="modal-actions">
                {onCancel && <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : submitText}
                </button>
            </div>
        </form>
    );
};

export default MedicineForm;
