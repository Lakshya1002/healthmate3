import React, { useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { XCircle, Save } from 'lucide-react';

const EditModal = ({ medicine, onClose, onUpdate }) => {
    // State for the form within the modal, initialized with the medicine's data
    const [editForm, setEditForm] = useState({
        name: medicine.name || "",
        dosage: medicine.dosage || "",
        method: medicine.method || "pill",
        start_date: medicine.start_date?.slice(0, 10) || "",
        end_date: medicine.end_date?.slice(0, 10) || "",
        notes: medicine.notes || "",
    });

    // Handles changes to any input in the edit form
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Handles the submission of the update
    const handleUpdate = async () => {
        const loadingToast = toast.loading("Updating medicine...");
        try {
            // Send the updated form data to the backend
            await API.put(`/medicines/${medicine.medicine_id}`, editForm);
            toast.success("Medicine updated!", { id: loadingToast });
            onUpdate(); // Trigger a data refresh in the parent component
            onClose();  // Close the modal
        } catch (error) {
            console.error("Error updating medicine:", error);
            toast.error("Failed to update.", { id: loadingToast });
        }
    };
    
    return (
        // The semi-transparent background overlay
        <div className="modal-overlay" onClick={onClose}>
            {/* The modal content itself. stopPropagation prevents closing when clicking inside the card. */}
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Medicine</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Close modal">
                        <XCircle size={24} />
                    </button>
                </div>
                {/* The form reuses the same styling but is now for editing */}
                <form className="medicine-form" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                    <input type="text" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Medicine Name" style={{paddingLeft: '12px'}}/>
                    <input type="text" name="dosage" value={editForm.dosage} onChange={handleEditChange} placeholder="Dosage" style={{paddingLeft: '12px'}}/>
                    <select name="method" value={editForm.method} onChange={handleEditChange} style={{paddingLeft: '12px'}}>
                        <option value="pill">Pill</option>
                        <option value="tablet">Tablet</option>
                        <option value="syrup">Syrup</option>
                        <option value="injection">Injection</option>
                    </select>
                    <div className="date-group"><label>Start:</label><input type="date" name="start_date" value={editForm.start_date} onChange={handleEditChange} style={{paddingLeft: '12px'}}/></div>
                    <div className="date-group"><label>End:</label><input type="date" name="end_date" value={editForm.end_date} onChange={handleEditChange} style={{paddingLeft: '12px'}}/></div>
                    <textarea name="notes" value={editForm.notes} onChange={handleEditChange} placeholder="Notes"/>
                </form>
                 <div className="modal-actions">
                    <button onClick={onClose} className="btn">Cancel</button>
                    <button onClick={handleUpdate} className="btn btn-primary">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
