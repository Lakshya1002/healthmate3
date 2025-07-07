import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import MedicineForm from "../components/MedicineForm";
import MedicineList from "../components/MedicineList";
import StatCard from "../components/StatCard";
import API from "../api";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // Import useAuth
import { Pill, Check, Clock, Search, List, LayoutGrid } from 'lucide-react';

function Home() {
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth(); // Get user from auth context

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Could not fetch medicines.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const filteredMedicines = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to beginning of today for accurate date comparison

    return medicines
      .filter(med => {
        if (activeTab === 'active') {
          // Active if no end date, or end date is today or in the future
          return !med.end_date || new Date(med.end_date) >= now;
        } else { // 'past' tab
          // Past if end date exists and is before today
          return med.end_date && new Date(med.end_date) < now;
        }
      })
      .filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [medicines, activeTab, searchQuery]);

  const activeCount = useMemo(() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return medicines.filter(med => !med.end_date || new Date(med.end_date) >= now).length;
  }, [medicines]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Your personal health dashboard is ready.</p>
      </div>

      <div className="stat-cards-container">
        <StatCard icon={<Pill size={28}/>} value={activeCount} label="Active Medicines" />
        <StatCard icon={<Check size={28}/>} value="0" label="Doses Taken Today" />
        <StatCard icon={<Clock size={28}/>} value={medicines.length - activeCount} label="Past Medicines" />
      </div>

      <div className="home-grid">
        <div className="medicine-form-container">
          <MedicineForm onMedicineAdded={fetchMedicines} />
        </div>
        <div className="medicine-list-container">
            <div className="card">
                <div className="controls-header">
                    <div className="tabs">
                        <button className={`tab-button ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                            Active
                            {activeTab === 'active' && <motion.div className="active-tab-indicator" layoutId="activeTab" />}
                        </button>
                        <button className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
                            Past
                            {activeTab === 'past' && <motion.div className="active-tab-indicator" layoutId="activeTab" />}
                        </button>
                    </div>
                    <div className="search-and-view">
                        <div className="search-bar">
                            <Search className="icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="view-toggle">
                            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={20}/></button>
                            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={20}/></button>
                        </div>
                    </div>
                </div>
                <MedicineList 
                    medicines={filteredMedicines} 
                    fetchMedicines={fetchMedicines} 
                    isLoading={isLoading}
                    viewMode={viewMode}
                />
            </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Home;