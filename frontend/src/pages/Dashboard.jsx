import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import MedicineList from "../components/MedicineList";
import StatCard from "../components/StatCard";
import API from "../api";
import toast from "react-hot-toast";
import { Pill, Check, Clock, Search, List, LayoutGrid, Plus } from 'lucide-react';

// Helper function to get a greeting based on the time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

function Dashboard({ setActivePage }) {
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/medicines");
      setMedicines(res.data);
    } catch (error) {
      toast.error("Could not fetch medicines.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // useMemo will cache the result of these complex filter operations
  const filteredMedicines = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return medicines
      .filter(med => {
        const endDate = med.end_date ? new Date(med.end_date) : null;
        if (activeTab === 'active') {
            return !endDate || endDate >= now;
        }
        return endDate && endDate < now;
      })
      .filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [medicines, activeTab, searchQuery]);

  const activeCount = useMemo(() => medicines.filter(med => !med.end_date || new Date(med.end_date) >= new Date()).length, [medicines]);

  return (
    <>
      <div className="page-header dashboard-header-enhanced">
        <div>
            <h1>{getGreeting()} !</h1>
            <p>Here’s what’s on your health dashboard today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActivePage('add')}>
            <Plus size={20} />
            Add Medicine
        </button>
      </div>

      <div className="stat-cards-container">
        <StatCard icon={<Pill size={28}/>} value={activeCount} label="Active Medicines" />
        <StatCard icon={<Clock size={28}/>} value={medicines.length - activeCount} label="Archived Medicines" />
        <StatCard icon={<Check size={28}/>} value="98%" label="Adherence (Soon!)" />
      </div>

      <div className="card">
          <div className="controls-header">
              <div className="tabs">
                  <button className={`tab-button ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                      Active
                      {activeTab === 'active' && <motion.div className="active-tab-indicator" layoutId="activeTab" />}
                  </button>
                  <button className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
                      Archived
                      {activeTab === 'past' && <motion.div className="active-tab-indicator" layoutId="activeTab" />}
                  </button>
              </div>
              <div className="search-and-view">
                  <div className="search-bar">
                      <Search className="icon" size={18} />
                      <input type="text" placeholder="Search medicines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="view-toggle">
                      <button title="List View" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={20}/></button>
                      <button title="Grid View" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={20}/></button>
                  </div>
              </div>
          </div>
          <MedicineList medicines={filteredMedicines} fetchMedicines={fetchMedicines} isLoading={isLoading} viewMode={viewMode}/>
      </div>
    </>
  );
}

export default Dashboard;
