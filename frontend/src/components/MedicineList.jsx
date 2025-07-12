// frontend/src/components/MedicineList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Pill, PlusCircle } from 'lucide-react';
import Loader from "./Loader";
import MedicineListItem from "./MedicineListItem";
import MedicineGridItem from "./MedicineGridItem";
import Button from "./ui/Button"; // Import the Button component

function MedicineList({ medicines, isLoading, viewMode, onEdit, onDelete, onGetInfo }) {
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (!medicines || medicines.length === 0) {
    return (
        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '1rem' }}>
            <Pill size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }}/>
            <h3>Your Medicine Cabinet is Empty</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '45ch', margin: '0 auto 1.5rem auto' }}>
                It looks like you haven't added any medications yet. Click the button below to get started.
            </p>
            <Button onClick={() => navigate('/add')}>
                <PlusCircle size={20} />
                Add Your First Medicine
            </Button>
        </div>
    );
  }

  return (
    <div>
        {viewMode === 'list' ? (
            <ul className="medicine-list">
                <AnimatePresence>
                    {medicines.map((med, i) => (
                        <MedicineListItem
                            key={med.id}
                            med={med}
                            index={i}
                            onEdit={() => onEdit(med)}
                            onDelete={() => onDelete(med)}
                            onGetInfo={() => onGetInfo(med)}
                        />
                    ))}
                </AnimatePresence>
            </ul>
        ) : (
            <div className="medicine-grid">
                 <AnimatePresence>
                    {medicines.map((med, i) => (
                       <MedicineGridItem
                            key={med.id}
                            med={med}
                            index={i}
                            onEdit={() => onEdit(med)}
                            onDelete={() => onDelete(med)}
                            onGetInfo={() => onGetInfo(med)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
    </div>
  );
}
export default MedicineList;
