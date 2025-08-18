// frontend/src/components/HealthLogForm.jsx
import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

const HealthLogForm = ({ onSubmit, initialData = {}, onCancel, submitText = 'Submit' }) => {
    const [formData, setFormData] = useState({
        log_date: '',
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        notes: '',
    });

    useEffect(() => {
        setFormData({
            log_date: initialData.log_date ? new Date(initialData.log_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            blood_pressure: initialData.blood_pressure || '',
            heart_rate: initialData.heart_rate || '',
            temperature: initialData.temperature || '',
            weight: initialData.weight || '',
            notes: initialData.notes || '',
        });
    }, [initialData]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.log_date) {
            setError('Log date is required.');
            return;
        }
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
        <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="error-message" style={{ gridColumn: '1 / -1' }}>{error}</div>}
            
            <div className="form-group">
                <label htmlFor="log_date">Date</label>
                <input id="log_date" type="date" name="log_date" value={formData.log_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="blood_pressure">Blood Pressure (e.g., 120/80)</label>
                <input id="blood_pressure" type="text" name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="heart_rate">Heart Rate (bpm)</label>
                <input id="heart_rate" type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} />
            </div>
             <div className="form-group">
                <label htmlFor="temperature">Temperature (°F)</label>
                <input id="temperature" type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="weight">Weight (lbs)</label>
                <input id="weight" type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="4"></textarea>
            </div>

            <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                {onCancel && <Button onClick={onCancel} variant="secondary" type="button">Cancel</Button>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitText}
                </Button>
            </div>
        </form>
    );
};

export default HealthLogForm;
