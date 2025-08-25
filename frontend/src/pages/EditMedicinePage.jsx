// frontend/src/pages/EditMedicinePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMedicines, updateMedicine } from '../api';
import MedicineForm from '../components/MedicineForm';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const EditMedicinePage = () => {
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    const loadMedicineData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: allMedicines } = await fetchMedicines();
            const medicineToEdit = allMedicines.find(m => m.id.toString() === id);
            
            if (medicineToEdit) {
                setInitialData(medicineToEdit);
            } else {
                toast.error("Medicine not found.");
                navigate('/');
            }
        } catch (error) {
            toast.error("Failed to load medicine data for editing.");
            console.error("Failed to fetch data for editing", error);
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadMedicineData();
    }, [loadMedicineData]);

    const handleSave = async (formData) => {
        const promise = updateMedicine(id, formData);
        toast.promise(promise, {
            loading: 'Saving changes...',
            success: 'Medicine updated successfully!',
            error: 'Failed to update medicine.'
        });
        
        try {
            await promise;
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading || !initialData) {
        return <Loader />;
    }

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
             <motion.div 
                className="page-header" 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
            >
                <Button variant="secondary" onClick={() => navigate(-1)} style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1><Edit /> Edit Medicine: {initialData.name}</h1>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Modify the details of your medication.</p>
                </div>
            </motion.div>
            <div className="card">
                <MedicineForm 
                    onSubmit={handleSave}
                    initialData={initialData}
                    onCancel={() => navigate(-1)}
                    submitText="Save Changes"
                />
            </div>
        </div>
    );
};

export default EditMedicinePage;
