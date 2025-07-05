import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import toast from "react-hot-toast";
import { Pill, Calendar, StickyNote, Hash, ListChecks, Plus } from 'lucide-react';

function MedicineForm({ onMedicineAdded }) {
  const [formData, setFormData] = useState({
    name: "", dosage: "", method: "pill", start_date: "", end_date: "", notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Medicine name is required.");
    
    setIsSubmitting(true);
    await toast.promise(
      API.post("/medicines", formData),
      {
        loading: 'Saving medicine...',
        success: () => {
          onMedicineAdded(); // Callback to navigate away
          return "Medicine added successfully!";
        },
        error: "Failed to add medicine.",
      }
    );
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="add-medicine-grid">
      {/* Left Column: The Form */}
      <div className="form-steps">
        <div className="card">
            {/* Step 1: Core Details */}
            <div className="form-step">
              <h3><Hash size={20}/> 1. Core Details</h3>
              <div className="input-group">
                <label htmlFor="name">Medicine Name</label>
                <input id="name" type="text" name="name" placeholder="e.g., Paracetamol" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="dosage">Dosage</label>
                <input id="dosage" type="text" name="dosage" placeholder="e.g., 500mg" value={formData.dosage} onChange={handleChange} />
              </div>
            </div>

            {/* Step 2: Method and Schedule */}
            <div className="form-step">
              <h3><ListChecks size={20}/> 2. Method & Schedule</h3>
              <div className="input-group">
                <label htmlFor="method">Method of Administration</label>
                <select id="method" name="method" value={formData.method} onChange={handleChange}>
                  <option value="pill">Pill</option><option value="tablet">Tablet</option>
                  <option value="syrup">Syrup</option><option value="injection">Injection</option>
                </select>
              </div>
              <div className="date-group">
                <div className="input-group" style={{flex: 1}}>
                  <label htmlFor="start_date">Start Date</label>
                  <input id="start_date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label htmlFor="end_date">End Date (Optional)</label>
                  <input id="end_date" type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Step 3: Notes */}
            <div className="form-step">
              <h3><StickyNote size={20}/> 3. Additional Notes</h3>
              <textarea name="notes" placeholder="e.g., Take with food, may cause drowsiness..." value={formData.notes} onChange={handleChange} />
            </div>
        </div>
      </div>

      {/* Right Column: Preview & Submit */}
      <div className="form-preview">
        <div className="card">
          <h2>Live Preview</h2>
          <div className="preview-item">
            <span className="preview-item-label">Name</span>
            <span className="preview-item-value">{formData.name || <span className="placeholder">Not set</span>}</span>
          </div>
           <div className="preview-item">
            <span className="preview-item-label">Dosage</span>
            <span className="preview-item-value">{formData.dosage || <span className="placeholder">Not set</span>}</span>
          </div>
           <div className="preview-item">
            <span className="preview-item-label">Method</span>
            <span className="preview-item-value capitalize">{formData.method}</span>
          </div>
           <div className="preview-item">
            <span className="preview-item-label">Starts On</span>
            <span className="preview-item-value">{formData.start_date || <span className="placeholder">Not set</span>}</span>
          </div>
           <div className="preview-item">
            <span className="preview-item-label">Ends On</span>
            <span className="preview-item-value">{formData.end_date || <span className="placeholder">Ongoing</span>}</span>
          </div>
          <div className="preview-item">
            <span className="preview-item-label">Notes</span>
            <span className="preview-item-value">{formData.notes || <span className="placeholder">No notes</span>}</span>
          </div>
          
          <motion.button style={{width: '100%', marginTop: '2rem'}} whileTap={{ scale: 0.97 }} type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Plus size={20} />{isSubmitting ? 'Saving...' : 'Save to My Regimen'}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
export default MedicineForm;
