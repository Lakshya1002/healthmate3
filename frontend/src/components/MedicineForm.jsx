// frontend/src/components/MedicineForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { getMedicineSuggestions } from '../api'; 
import { Pill, Calendar, Package, ArrowLeft, Send, Syringe, Bot as SyrupIcon, Tablets, Repeat, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
        method: 'pill', // ✅ NEW: Add method to form state
    });
    
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const [otherMethodText, setOtherMethodText] = useState(''); // ✅ NEW: State for other method text

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
            method: initialData.method || 'pill', // ✅ NEW: Set initial method
        });
        // ✅ NEW: If the initial method is not a standard one, set the otherMethodText
        if (initialData.method && !['pill', 'tablet', 'syrup', 'injection'].includes(initialData.method)) {
             setOtherMethodText(initialData.method);
        }
    }, [initialData.id, initialData.name, initialData.method]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSuggestions = useCallback(async (query) => {
        if (query.length < 2) {
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
    
    // ✅ NEW: Handle method change
    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, method }));
        if (method !== 'other') {
            setOtherMethodText('');
        }
    };

    const handleOtherMethodChange = (e) => {
        setOtherMethodText(e.target.value);
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
        
        // Finalize the method value before submitting
        const finalMethod = formData.method === 'other' ? otherMethodText : formData.method;
        if (formData.method === 'other' && !finalMethod) {
            setError('Please specify the intake method.');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({ ...formData, method: finalMethod });
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
     const methodButtons = [
        { key: 'pill', icon: <Pill />, label: 'Pill' },
        { key: 'tablet', icon: <Tablets />, label: 'Tablet' },
        { key: 'syrup', icon: <SyrupIcon />, label: 'Syrup' },
        { key: 'injection', icon: <Syringe />, label: 'Injection' },
        { key: 'other', icon: <HelpCircle />, label: 'Other' },
    ];

    return (
        <form onSubmit={handleSubmit} className="form-grid">
            {error && <div className="error-message" style={{ gridColumn: '1 / -1' }}>{error}</div>}
            
            {/* ✅ NEW: Add method selection buttons */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Method of Intake</label>
                <div className="method-selector">
                    {methodButtons.map(btn => (
                        <button 
                            type="button" 
                            key={btn.key} 
                            className={`method-btn ${formData.method === btn.key ? 'active' : ''}`} 
                            onClick={() => handleMethodChange(btn.key)}
                        >
                            {btn.icon}<span>{btn.label}</span>
                        </button>
                    ))}
                </div>
                 {formData.method === 'other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="other-method-input">
                        <label htmlFor="otherMethodText">Please specify the method</label>
                        <input id="otherMethodText" type="text" value={otherMethodText} onChange={handleOtherMethodChange} required />
                    </motion.div>
                )}
            </div>

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