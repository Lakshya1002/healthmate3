// frontend/src/components/MultiStepForm.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { addMedicine, getMedicineSuggestions } from '../api';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { Pill, Calendar, Package, ArrowLeft, Send, Syringe, Bot as SyrupIcon, Tablets, Repeat, HelpCircle } from 'lucide-react';
import '../MultiStepForm.css';

const steps = [
    { id: 1, name: 'Medicine Info', icon: <Pill /> },
    { id: 2, name: 'Schedule', icon: <Calendar /> },
    { id: 3, name: 'Inventory & Notes', icon: <Package /> },
];

const MultiStepForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        method: 'pill',
        frequency: 'Once a day',
        start_date: '',
        end_date: '',
        quantity: '',
        refill_threshold: '',
        notes: '',
    });
    const [frequencyType, setFrequencyType] = useState('daily');
    const [otherMethodText, setOtherMethodText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const [errors, setErrors] = useState({});

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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        if (name === 'name') {
            fetchSuggestions(value);
        }
        if (name === 'frequency' && frequencyType === 'custom') {
             setFormData(prev => ({ ...prev, frequency: value }));
        }
    };

    const handleSuggestionClick = (name) => {
        setFormData(prev => ({ ...prev, name }));
        setSuggestions([]);
        setIsSuggestionsVisible(false);
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: null }));
        }
    };
    
    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, method }));
         if (method !== 'other') {
            setOtherMethodText('');
        }
    };

    const handleFrequencyChange = (type, value) => {
        setFrequencyType(type);
        if (type !== 'custom') {
            setFormData(prev => ({ ...prev, frequency: value }));
        } else {
             setFormData(prev => ({ ...prev, frequency: '' }));
        }
    };

    const validateStep = () => {
        const newErrors = {};
        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = 'Medicine name is required.';
            if (formData.method === 'other' && !otherMethodText.trim()) newErrors.otherMethod = 'Please specify the method.';
            if (!formData.dosage.trim()) newErrors.dosage = 'Dosage is required.';
        }
        if (currentStep === 2) {
            if (!formData.start_date) newErrors.start_date = 'Start date is required.';
            if (!formData.frequency.trim()) newErrors.frequency = 'Frequency is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            toast.error('Please fill out all required fields.');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (validateStep()) {
            setLoading(true);
            const finalFormData = {
                ...formData,
                method: formData.method === 'other' ? otherMethodText : formData.method,
            };
            try {
                await addMedicine(finalFormData);
                toast.success('Medicine added successfully!');
                navigate('/');
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error('Please fill out all required fields.');
        }
    };

    const renderStepContent = () => {
        const dosagePlaceholders = {
            pill: 'e.g., 1 pill',
            tablet: 'e.g., 2 tablets',
            syrup: 'e.g., 10ml',
            injection: 'e.g., 1ml',
            other: 'e.g., 1 patch'
        };

        switch (currentStep) {
            case 1:
                return (
                    <fieldset>
                        <legend>Medicine Details</legend>
                        <div className="form-group">
                            <label>Method of Intake</label>
                            <div className="method-selector">
                                <button type="button" className={`method-btn ${formData.method === 'pill' ? 'active' : ''}`} onClick={() => handleMethodChange('pill')}><Pill/><span>Pill</span></button>
                                <button type="button" className={`method-btn ${formData.method === 'tablet' ? 'active' : ''}`} onClick={() => handleMethodChange('tablet')}><Tablets/><span>Tablet</span></button>
                                <button type="button" className={`method-btn ${formData.method === 'syrup' ? 'active' : ''}`} onClick={() => handleMethodChange('syrup')}><SyrupIcon/><span>Syrup</span></button>
                                <button type="button" className={`method-btn ${formData.method === 'injection' ? 'active' : ''}`} onClick={() => handleMethodChange('injection')}><Syringe/><span>Injection</span></button>
                                <button type="button" className={`method-btn ${formData.method === 'other' ? 'active' : ''}`} onClick={() => handleMethodChange('other')}><HelpCircle/><span>Other</span></button>
                            </div>
                            {formData.method === 'other' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="other-method-input">
                                    <label htmlFor="otherMethodText">Please specify the method</label>
                                    <input id="otherMethodText" type="text" value={otherMethodText} onChange={(e) => setOtherMethodText(e.target.value)} required className={errors.otherMethod ? 'input-error' : ''} />
                                    {errors.otherMethod && <p className="error-text">{errors.otherMethod}</p>}
                                </motion.div>
                            )}
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label htmlFor="name">Medicine Name</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required autoComplete="off" onFocus={() => setIsSuggestionsVisible(true)} onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 200)} className={errors.name ? 'input-error' : ''} />
                            {errors.name && <p className="error-text">{errors.name}</p>}
                            <AnimatePresence>
                                {isSuggestionsVisible && suggestions.length > 0 && (
                                    <motion.ul className="suggestions-list" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        {suggestions.map((suggestion, index) => (
                                            <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dosage">Dosage</label>
                            <input id="dosage" type="text" name="dosage" value={formData.dosage} onChange={handleChange} required placeholder={dosagePlaceholders[formData.method]} className={errors.dosage ? 'input-error' : ''} />
                            {errors.dosage && <p className="error-text">{errors.dosage}</p>}
                        </div>
                    </fieldset>
                );
            case 2:
                return (
                    <fieldset>
                        <legend>Scheduling & Frequency</legend>
                         <div className="form-group">
                            <label>How often do you take it?</label>
                            <div className="frequency-selector">
                                <button type="button" className={`frequency-btn ${frequencyType === 'daily' ? 'active' : ''}`} onClick={() => handleFrequencyChange('daily', 'Once a day')}>Once a day</button>
                                <button type="button" className={`frequency-btn ${frequencyType === 'twice' ? 'active' : ''}`} onClick={() => handleFrequencyChange('twice', 'Twice a day')}>Twice a day</button>
                                <button type="button" className={`frequency-btn ${frequencyType === 'custom' ? 'active' : ''}`} onClick={() => handleFrequencyChange('custom', '')}><Repeat size={16}/> Custom</button>
                            </div>
                             {errors.frequency && <p className="error-text">{errors.frequency}</p>}
                            {frequencyType === 'custom' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="form-group" style={{marginTop: '1rem'}}>
                                    <label htmlFor="frequency">Custom Frequency</label>
                                    <input id="frequency" type="text" name="frequency" value={formData.frequency} onChange={handleChange} required placeholder="e.g., Every 6 hours" className={errors.frequency ? 'input-error' : ''} />
                                </motion.div>
                            )}
                        </div>
                        <div className="form-grid-2-col">
                            <div className="form-group">
                                <label htmlFor="start_date">Start Date</label>
                                <input id="start_date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className={errors.start_date ? 'input-error' : ''} />
                                {errors.start_date && <p className="error-text">{errors.start_date}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="end_date">End Date (Optional)</label>
                                <input id="end_date" type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                            </div>
                        </div>
                    </fieldset>
                );
            case 3:
                return (
                    <fieldset>
                         <legend>Inventory & Instructions</legend>
                         <div className="form-grid-2-col">
                            <div className="form-group">
                                <label htmlFor="quantity">Current Quantity (Optional)</label>
                                <input id="quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 90" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="refill_threshold">Refill Reminder at (Optional)</label>
                                <input id="refill_threshold" type="number" name="refill_threshold" value={formData.refill_threshold} onChange={handleChange} placeholder="e.g., 10" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes (Optional)</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="4" placeholder="e.g., Take with food, store in a cool place..."></textarea>
                        </div>
                    </fieldset>
                );
            default:
                return null;
        }
    };

    return (
        <div className="card multi-step-form-container">
            <div className="stepper">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className={`step-item ${currentStep >= step.id ? 'active' : ''}`}>
                            <div className="step-icon">{step.icon}</div>
                            <div className="step-name">{step.name}</div>
                        </div>
                        {index < steps.length - 1 && <div className="step-connector" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="step-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="step-navigation">
                <div>
                    {currentStep > 1 && (
                        <Button variant="secondary" onClick={handleBack}>
                            <ArrowLeft size={16} /> Back
                        </Button>
                    )}
                </div>
                <div>
                    {currentStep < steps.length && (
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    )}
                    {currentStep === steps.length && (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : 'Finish & Save'}
                            {!loading && <Send size={16} />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MultiStepForm;
