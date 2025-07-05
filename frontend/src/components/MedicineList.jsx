import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Info } from 'lucide-react';
import EditModal from "./EditModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Loader from "./Loader";
import MedicineListItem from "./MedicineListItem";
import MedicineGridItem from "./MedicineGridItem";

function MedicineList({ medicines, fetchMedicines, isLoading, viewMode }) {
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);

  if (isLoading) {
    return <Loader />;
  }

  if (medicines.length === 0) {
    return (
        <div className="empty-state">
            <Info size={48} className="icon"/>
            <p>No medicines found for this view.</p>
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
                            key={med.medicine_id}
                            med={med}
                            index={i}
                            onEdit={() => setEditingMedicine(med)}
                            onDelete={() => setDeletingMedicine(med)}
                        />
                    ))}
                </AnimatePresence>
            </ul>
        ) : (
            <div className="medicine-grid">
                 <AnimatePresence>
                    {medicines.map((med, i) => (
                       <MedicineGridItem
                            key={med.medicine_id}
                            med={med}
                            index={i}
                            onEdit={() => setEditingMedicine(med)}
                            onDelete={() => setDeletingMedicine(med)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}

      <AnimatePresence>
        {editingMedicine && <EditModal medicine={editingMedicine} onClose={() => setEditingMedicine(null)} onUpdate={fetchMedicines} />}
        {deletingMedicine && <DeleteConfirmModal medicine={deletingMedicine} onClose={() => setDeletingMedicine(null)} onConfirm={fetchMedicines} />}
      </AnimatePresence>
    </div>
  );
}
export default MedicineList;
