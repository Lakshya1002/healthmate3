// frontend/src/components/MedicineForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { getMedicineSuggestions } from '../api'; // ✅ Import our new function

const MedicineForm = ({ onSubmit, initialData = {}, onCancel, submitText = 'Submit' }) => {
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: '',
        quantity: '',
        refill_threshold: '',
    });
    
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

    useEffect(() => {
        setFormData({
            name: initialData.name || '',
            dosage: initialData.dosage || '',
            frequency: initialData.frequency || '',
            start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
            end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
            notes: initialData.notes || '',
            quantity: initialData.quantity || '',
            refill_threshold: initialData.refill_threshold || '',
        });
    }, [initialData.id, initialData.name]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ✅ UPDATED: Fetch suggestions from our own backend
    const fetchSuggestions = useCallback(async (query) => {
        if (query.length < 2) { // Can be 2 now since it's faster
            setSuggestions([]);
            return;
        }
        try {
            const { data } = await getMedicineSuggestions(query);
            setSuggestions(data || []);
            setIsSuggestionsVisible(true);
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name') {
            fetchSuggestions(value);
        }
    };

    const handleSuggestionClick = (name) => {
        setFormData(prev => ({ ...prev, name }));
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };

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
        <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="error-message" style={{ gridColumn: '1 / -1' }}>{error}</div>}
            
            <div className="form-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                <label htmlFor="name">Medicine Name</label>
                <input 
                    id="name" 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    autoComplete="off"
                    onFocus={() => setIsSuggestionsVisible(true)}
                    onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 200)}
                />
                <AnimatePresence>
                    {isSuggestionsVisible && suggestions.length > 0 && (
                        <motion.ul 
                            className="suggestions-list"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
            
            {/* ... other form fields ... */}
            <div className="form-group">
                <label htmlFor="dosage">Dosage (e.g., 500mg)</label>
                <input id="dosage" type="text" name="dosage" value={formData.dosage} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="frequency">Frequency (e.g., Twice a day)</label>
                <input id="frequency" type="text" name="frequency" value={formData.frequency} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input id="start_date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="end_date">End Date (Optional)</label>
                <input id="end_date" type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="quantity">Quantity (e.g., 90 pills)</label>
                <input id="quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-group">
                <label htmlFor="refill_threshold">Refill at (e.g., 10 left)</label>
                <input id="refill_threshold" type="number" name="refill_threshold" value={formData.refill_threshold} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
            </div>

            <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
                {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitText}
                </Button>
            </div>
        </form>
    );
};

export default MedicineForm;
