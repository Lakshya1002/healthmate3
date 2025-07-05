import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import toast from "react-hot-toast";
import { Trash2 } from 'lucide-react';

function DeleteConfirmModal({ medicine, onClose, onConfirm }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await toast.promise(
            API.delete(`/medicines/${medicine.medicine_id}`),
            {
                loading: 'Deleting...',
                success: 'Medicine deleted.',
                error: 'Failed to delete.'
            }
        );
        onConfirm(); // This will trigger fetchMedicines
        onClose();   // Close the modal
    };

    return (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content card delete-modal-content" initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }}>
                <div className="icon"><Trash2 size={30} /></div>
                <h3>Delete Medicine</h3>
                <p>Are you sure you want to delete <strong>{medicine.name}</strong>? This action cannot be undone.</p>
                <div className="modal-actions">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="btn" disabled={isDeleting}>
                        Cancel
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleDelete} className="btn btn-danger" disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default DeleteConfirmModal;
