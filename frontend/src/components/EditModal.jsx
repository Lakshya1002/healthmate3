// frontend/src/components/EditModal.jsx
import React from 'react';
import { updateMedicine } from '../api';
// Corrected Path: Point to the 'ui' subdirectory
import Modal from './ui/Modal'; 
import MedicineForm from './MedicineForm';

const EditModal = ({ isOpen, onClose, medicine, onSuccess }) => {

  const handleUpdate = async (formData) => {
    await updateMedicine(medicine.id, formData);
    onSuccess(); // Callback to refresh data on the Dashboard
    onClose();   // Close the modal
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Medicine">
      <MedicineForm
        onSubmit={handleUpdate}
        initialData={medicine}
        onCancel={onClose}
        submitText="Save Changes"
      />
    </Modal>
  );
};

export default EditModal;
