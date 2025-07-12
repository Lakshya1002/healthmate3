// frontend/src/components/remindersForm.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addReminder } from '../api';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import { Pill, Clock, Search } from 'lucide-react';
import '../remindersForm.css';

const ReminderForm = ({ medicines, onSuccess, onCancel }) => {
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [time, setTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const dropdownRef = useRef(null);

    const filteredMedicines = useMemo(() => {
        if (!searchTerm) {
            return medicines;
        }
        return medicines.filter(m => 
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
        setSelectedMedicine(null);
        setDropdownOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMedicine || !time) {
            toast.error("Please select a medicine and a time.");
            return;
        }
        setIsLoading(true);

        const promise = addReminder({ medicine_id: selectedMedicine.id, reminder_time: time });
        toast.promise(promise, {
            loading: 'Adding reminder...',
            success: 'Reminder added successfully!',
            error: 'Failed to add reminder.'
        });

        try {
            await promise;
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="reminder-form-container">
            <div className="form-group">
                <label htmlFor="medicine-search">Medicine</label>
                <div className="searchable-dropdown" ref={dropdownRef}>
                    <div className="search-input-wrapper">
                        <Search size={18} className="icon" />
                        <input 
                            id="medicine-search"
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={() => setDropdownOpen(true)}
                            placeholder="Search for a medicine..."
                            autoComplete="off"
                        />
                    </div>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                className="dropdown-list"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {filteredMedicines.length > 0 ? (
                                    filteredMedicines.map(med => (
                                        <div 
                                            key={med.id} 
                                            className={`dropdown-item ${selectedMedicine?.id === med.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectMedicine(med)}
                                        >
                                            <Pill size={16} className="icon" />
                                            <span>{med.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-dropdown">No medicines found.</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="time">Reminder Time</label>
                <div className="input-with-icon">
                    <Clock size={18} className="icon" />
                    <input 
                        id="time" 
                        type="time" 
                        value={time} 
                        onChange={e => setTime(e.target.value)} 
                        required 
                        style={{paddingLeft: '2.75rem'}}
                    />
                </div>
            </div>
            <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading || !selectedMedicine}>
                    {isLoading ? 'Adding...' : 'Add Reminder'}
                </Button>
            </div>
        </form>
    );
};

export default ReminderForm;
