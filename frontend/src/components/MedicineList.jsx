import React from "react";
import { AnimatePresence } from "framer-motion";
import { Info } from 'lucide-react';
import Loader from "./Loader";
import MedicineListItem from "./MedicineListItem";
import MedicineGridItem from "./MedicineGridItem";

function MedicineList({ medicines, isLoading, viewMode, onEdit, onDelete, onGetInfo }) {

  if (isLoading) {
    return <Loader />;
  }

  if (!medicines || medicines.length === 0) {
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
                            key={med.id}
                            med={med}
                            index={i}
                            onEdit={() => onEdit(med)}
                            onDelete={() => onDelete(med)}
                            onGetInfo={() => onGetInfo(med)} // ✅ Pass handler
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
                            onGetInfo={() => onGetInfo(med)} // ✅ Pass handler
                        />
                    ))}
                </AnimatePresence>
            </div>
        )}
    </div>
  );
}
export default MedicineList;
