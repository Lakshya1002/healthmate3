// frontend/src/components/EditModal.jsx
import React, { useState, useEffect } from 'react';
import { updateMedicine } from '../api';
import Modal from './ui/Modal'; 
import Button from './ui/Button';
import toast from 'react-hot-toast';
import { Pill, Calendar, Package, ArrowLeft, Send, Syringe, Tablets, Bot, Repeat, HelpCircle, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// This is a simplified form specifically for editing within the modal.
const EditMedicineForm = ({ initialData, onSubmit, onCancel, submitText }) => {
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: '',
        quantity: '',
        refill_threshold: '',
        method: '', 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otherMethodText, setOtherMethodText] = useState(''); 

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                dosage: initialData.dosage || '',
                frequency: initialData.frequency || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
                end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
                notes: initialData.notes || '',
                quantity: initialData.quantity || '',
                refill_threshold: initialData.refill_threshold || '',
                method: initialData.method || 'pill',
            });
            if (initialData.method && !['pill', 'tablet', 'syrup', 'injection'].includes(initialData.method)) {
                setOtherMethodText(initialData.method);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, method }));
        if (method !== 'other') {
            setOtherMethodText('');
        }
    };
    
    const handleOtherMethodChange = (e) => {
        setOtherMethodText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

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
        { key: 'syrup', icon: <Bot />, label: 'Syrup' },
        { key: 'injection', icon: <Syringe />, label: 'Injection' },
        { key: 'other', icon: <HelpCircle />, label: 'Other' },
    ];
    
    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div className="error-message">{error}</div>}
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '1rem' }}>
              <div className="form-group">
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

              <div className="form-group">
                  <label htmlFor="name">Medicine Name</label>
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required autoComplete="off" />
              </div>
              
              <div className="form-group">
                  <label htmlFor="dosage">Dosage</label>
                  <input id="dosage" type="text" name="dosage" value={formData.dosage} onChange={handleChange} required />
              </div>
              <div className="form-group">
                  <label htmlFor="frequency">Frequency</label>
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
                  <label htmlFor="quantity">Quantity</label>
                  <input id="quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                  <label htmlFor="refill_threshold">Refill at</label>
                  <input id="refill_threshold" type="number" name="refill_threshold" value={formData.refill_threshold} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
              </div>
            </div>

            <div className="modal-actions">
                {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : submitText}
                </Button>
            </div>
        </form>
    );
};

// Main EditModal component
const EditModal = ({ isOpen, onClose, medicine, onSuccess }) => {

  const handleUpdate = async (formData) => {
    const promise = updateMedicine(medicine.id, formData);
    toast.promise(promise, {
        loading: 'Saving changes...',
        success: 'Medicine updated successfully!',
        error: (err) => err.response?.data?.message || 'Failed to update medicine.'
    });
    
    try {
        await promise;
        onSuccess(); // Callback to refresh data on the Dashboard
        onClose();   // Close the modal
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${medicine.name}`}>
      <EditMedicineForm
        onSubmit={handleUpdate}
        initialData={medicine}
        onCancel={onClose}
        submitText="Save Changes"
      />
    </Modal>
  );
};

export default EditModal;
