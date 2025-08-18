import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { Thermometer, Heart, Weight, StickyNote, Calendar } from 'lucide-react';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="log_date">Date</label>
                <div className="input-with-icon">
                    <Calendar size={18} />
                    <input id="log_date" type="date" name="log_date" value={formData.log_date} onChange={handleChange} required style={{paddingLeft: '2.75rem'}}/>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="blood_pressure">Blood Pressure (e.g., 120/80)</label>
                    <input id="blood_pressure" type="text" name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="heart_rate">Heart Rate (bpm)</label>
                    <div className="input-with-icon">
                        <Heart size={18} />
                        <input id="heart_rate" type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} style={{paddingLeft: '2.75rem'}}/>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="temperature">Temperature (°F)</label>
                    <div className="input-with-icon">
                        <Thermometer size={18} />
                        <input id="temperature" type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} style={{paddingLeft: '2.75rem'}}/>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="weight">Weight (lbs)</label>
                    <div className="input-with-icon">
                        <Weight size={18} />
                        <input id="weight" type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} style={{paddingLeft: '2.75rem'}}/>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <div className="input-with-icon">
                     <StickyNote size={18} style={{top: '1rem', transform: 'none'}}/>
                    <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="4" style={{paddingLeft: '2.75rem'}}></textarea>
                </div>
            </div>

            <div className="modal-actions" style={{justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                {onCancel && <Button onClick={onCancel} variant="secondary" type="button">Cancel</Button>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitText}
                </Button>
            </div>
        </form>
    );
};

export default HealthLogForm;
