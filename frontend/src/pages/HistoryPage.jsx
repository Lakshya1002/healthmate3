// frontend/src/pages/HistoryPage.jsx (NEW FILE)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styling for the calendar
import { motion } from 'framer-motion';
import { fetchDoseHistory } from '../api';
import Loader from '../components/Loader';
import { CheckCircle, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import '../HistoryPage.css'; // We will create this file next

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const loadHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchDoseHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch dose history", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Group history by date for easy lookup
    const historyByDate = useMemo(() => {
        return history.reduce((acc, record) => {
            const date = new Date(record.logged_at).toDateString();
            if (!acc[date]) {
                acc[date] = { taken: 0, skipped: 0, records: [] };
            }
            if (record.status === 'taken') {
                acc[date].taken++;
            } else if (record.status === 'skipped') {
                acc[date].skipped++;
            }
            acc[date].records.push(record);
            return acc;
        }, {});
    }, [history]);

    // Function to add custom styling to calendar tiles
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toDateString();
            if (historyByDate[dateString]) {
                const dayData = historyByDate[dateString];
                if (dayData.skipped > 0) {
                    return 'day-skipped'; // Highest priority
                }
                if (dayData.taken > 0) {
                    return 'day-taken';
                }
            }
        }
        return null;
    };

    const selectedDayData = historyByDate[selectedDate.toDateString()];

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dose History</h1>
                <p>Review your medication adherence over time. Click on a date to see details.</p>
            </div>

            <div className="history-layout">
                <motion.div className="calendar-container card" layout>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileClassName={tileClassName}
                    />
                    <div className="legend">
                        <span className="legend-item"><span className="dot taken"></span> Taken</span>
                        <span className="legend-item"><span className="dot skipped"></span> Skipped</span>
                    </div>
                </motion.div>

                <motion.div className="details-container card" layout>
                    <h4>
                        Details for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h4>
                    {selectedDayData ? (
                        <ul className="dose-list">
                            {selectedDayData.records.map((record, index) => (
                                <li key={index} className={`dose-item status-${record.status}`}>
                                    {record.status === 'taken' ? <CheckCircle className="icon" /> : <XCircle className="icon" />}
                                    <div className="dose-info">
                                        <span className="medicine-name">{record.medicine_name}</span>
                                        <span className="status-label">Marked as {record.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-details">
                            <BookOpen size={40} />
                            <p>No dose history recorded for this day.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HistoryPage;
