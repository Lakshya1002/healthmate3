// frontend/src/components/remindersForm.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { Pill, Clock, Search, Sun, Moon, Sunset, Sunrise, Repeat, CalendarDays, Hash } from 'lucide-react';
import '../remindersForm.css';

// A preview component to show what the reminder will look like.
const ReminderPreview = ({ medicineName, time, frequency, days }) => {
    const getFrequencyText = () => {
        if (!time) return 'Set a time...';
        switch (frequency) {
            case 'daily':
                return `Scheduled for ${time}, every day.`;
            case 'weekly':
                if (days.length === 0) return `Scheduled for ${time}, select days.`;
                const dayString = days.map(d => d.slice(0, 3)).join(', ');
                return `Scheduled for ${time}, on ${dayString}.`;
            case 'interval':
                 if (!days || isNaN(parseInt(days, 10)) || parseInt(days, 10) <= 0) return `Scheduled for ${time}, set interval.`;
                 return `Scheduled for ${time}, every ${days} days.`;
            default:
                return `Scheduled for ${time}.`;
        }
    };

    return (
        <div className="reminder-preview">
            <h4>Live Preview</h4>
            <p>This is how your reminder will appear in the timeline.</p>
            <div className="timeline-card-preview status-scheduled">
                 <div className="icon-status"><Clock size={20} /></div>
                 <div className="details">
                    <div className="medicine-name">{medicineName || 'Select a medicine...'}</div>
                    <div className="status-text">{getFrequencyText()}</div>
                </div>
            </div>
        </div>
    )
}

const ReminderForm = ({ medicines, onSuccess, onCancel, onSave, initialData = null, submitText = 'Submit' }) => {
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [time, setTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ ADDED: State for frequency management
    const [frequency, setFrequency] = useState('daily'); // 'daily', 'weekly', 'interval'
    const [selectedDays, setSelectedDays] = useState([]); // For 'weekly'
    const [dayInterval, setDayInterval] = useState(''); // For 'interval'
    
    const dropdownRef = useRef(null);
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Effect to populate form with initial data for editing
    useEffect(() => {
        if (initialData && medicines.length > 0) {
            const medicineToEdit = medicines.find(m => m.id === initialData.medicine_id);
            if (medicineToEdit) {
                setSelectedMedicine(medicineToEdit);
                setSearchTerm(medicineToEdit.name);
            }
            setTime(initialData.reminder_time ? initialData.reminder_time.slice(0, 5) : '');
            
            // ✅ ADDED: Populate frequency from initial data
            const freq = initialData.frequency || 'daily';
            setFrequency(freq);
            if (freq === 'weekly' && initialData.week_days) {
                setSelectedDays(initialData.week_days.split(','));
            } else if (freq === 'interval' && initialData.day_interval) {
                setDayInterval(initialData.day_interval);
            }
        }
    }, [initialData, medicines]);

    const filteredMedicines = useMemo(() => {
        if (!searchTerm) return medicines;
        return medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, medicines]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setSearchTerm(medicine.name);
        setDropdownOpen(false);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (selectedMedicine?.name !== e.target.value) setSelectedMedicine(null);
        setDropdownOpen(true);
    };

    const toggleDay = (day) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMedicine || !time) {
            toast.error("Please select a medicine and a time.");
            return;
        }
        if (frequency === 'weekly' && selectedDays.length === 0) {
            toast.error("Please select at least one day for weekly reminders.");
            return;
        }
         if (frequency === 'interval' && (!dayInterval || parseInt(dayInterval, 10) <= 0)) {
            toast.error("Please enter a valid number of days for the interval.");
            return;
        }

        setIsLoading(true);

        const payload = {
            medicine_id: selectedMedicine.id,
            reminder_time: time,
            frequency: frequency,
            week_days: frequency === 'weekly' ? selectedDays.join(',') : null,
            day_interval: frequency === 'interval' ? parseInt(dayInterval, 10) : null,
        };

        const promise = onSave(payload);
        
        toast.promise(promise, {
            loading: initialData ? 'Updating reminder...' : 'Adding reminder...',
            success: initialData ? 'Reminder updated successfully!' : 'Reminder added successfully!',
            error: initialData ? 'Failed to update reminder.' : 'Failed to add reminder.'
        });

        try {
            await promise;
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickTimes = [
        { label: 'Morning', time: '08:00', icon: <Sunrise size={16}/> },
        { label: 'Noon', time: '12:00', icon: <Sun size={16}/> },
        { label: 'Evening', time: '18:00', icon: <Sunset size={16}/> },
        { label: 'Night', time: '22:00', icon: <Moon size={16}/> },
    ];

    return (
        <div className="add-reminder-layout">
            <form onSubmit={handleFormSubmit} className="card reminder-form-card">
                <div className="form-group">
                    <label htmlFor="medicine-search">1. Select a Medicine</label>
                    <div className="searchable-dropdown" ref={dropdownRef}>
                        <div className="search-input-wrapper">
                            <Search size={18} className="icon" />
                            <input 
                                id="medicine-search" type="text" value={searchTerm}
                                onChange={handleInputChange} onFocus={() => setDropdownOpen(true)}
                                placeholder="Search your medicine cabinet..." autoComplete="off"
                            />
                        </div>
                        <AnimatePresence>
                            {isDropdownOpen && filteredMedicines.length > 0 && (
                                <motion.div className="dropdown-list" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {filteredMedicines.map(med => (
                                        <div key={med.id} className={`dropdown-item ${selectedMedicine?.id === med.id ? 'selected' : ''}`} onClick={() => handleSelectMedicine(med)}>
                                            <Pill size={16} className="icon" />
                                            <span>{med.name}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="form-group">
                    <label>2. Choose Frequency</label>
                    <div className="frequency-selector">
                        <button type="button" className={`frequency-btn ${frequency === 'daily' ? 'active' : ''}`} onClick={() => setFrequency('daily')}><Repeat size={16}/> Everyday</button>
                        <button type="button" className={`frequency-btn ${frequency === 'weekly' ? 'active' : ''}`} onClick={() => setFrequency('weekly')}><CalendarDays size={16}/> Specific Days</button>
                        <button type="button" className={`frequency-btn ${frequency === 'interval' ? 'active' : ''}`} onClick={() => setFrequency('interval')}><Hash size={16}/> Day Interval</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {frequency === 'weekly' && (
                        <motion.div key="weekly" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="form-group">
                            <label>Select days of the week</label>
                            <div className="day-picker">
                                {weekDays.map(day => (
                                    <button type="button" key={day} className={`day-btn ${selectedDays.includes(day) ? 'active' : ''}`} onClick={() => toggleDay(day)}>
                                        {day.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {frequency === 'interval' && (
                         <motion.div key="interval" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="form-group">
                            <label>Run every X days</label>
                            <div className="interval-input">
                                <span>Every</span>
                                <input type="number" value={dayInterval} onChange={(e) => setDayInterval(e.target.value)} min="1" placeholder="e.g., 3" />
                                <span>days</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="form-group">
                    <label htmlFor="time">3. Set Reminder Time</label>
                     <div className="quick-times-container">
                        {quickTimes.map(qt => (
                            <button type="button" key={qt.label} className={`quick-time-btn ${time === qt.time ? 'active' : ''}`} onClick={() => setTime(qt.time)}>
                                {qt.icon}
                                {qt.label}
                            </button>
                        ))}
                    </div>
                    <div className="input-with-icon">
                        <Clock size={18} className="icon" />
                        <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required style={{paddingLeft: '2.75rem'}}/>
                    </div>
                </div>
                <div className="modal-actions" style={{marginTop: 'auto', paddingTop: '2rem'}}>
                    {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit" disabled={isLoading || !selectedMedicine}>
                        {isLoading ? 'Saving...' : submitText}
                    </Button>
                </div>
            </form>
            <div className="card reminder-preview-card">
                 <ReminderPreview 
                    medicineName={selectedMedicine?.name} 
                    time={time}
                    frequency={frequency}
                    days={frequency === 'weekly' ? selectedDays : dayInterval}
                />
            </div>
        </div>
    );
};

export default ReminderForm;
