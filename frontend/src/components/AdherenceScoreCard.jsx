// frontend/src/components/AdherenceScoreCard.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

const AdherenceScoreCard = ({ history }) => {
    const score = useMemo(() => {
        if (!history || history.length === 0) {
            return { percentage: 100, trend: 'stable' };
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

        const recentHistory = history.filter(record => new Date(record.logged_at) > sevenDaysAgo);

        if (recentHistory.length === 0) {
            return { percentage: 100, trend: 'stable' };
        }

        const takenCount = recentHistory.filter(r => r.status === 'taken').length;
        const totalDoses = recentHistory.length;
        
        const percentage = Math.round((takenCount / totalDoses) * 100);

        // Simple trend calculation (could be improved)
        const firstHalf = recentHistory.slice(0, Math.floor(totalDoses / 2));
        const secondHalf = recentHistory.slice(Math.floor(totalDoses / 2));
        const firstHalfScore = firstHalf.length > 0 ? (firstHalf.filter(r => r.status === 'taken').length / firstHalf.length) : 0;
        const secondHalfScore = secondHalf.length > 0 ? (secondHalf.filter(r => r.status === 'taken').length / secondHalf.length) : 0;

        let trend = 'stable';
        if (secondHalfScore > firstHalfScore) trend = 'up';
        if (secondHalfScore < firstHalfScore) trend = 'down';

        return { percentage, trend };
    }, [history]);

    const getTrendInfo = () => {
        switch (score.trend) {
            case 'up': return { icon: <TrendingUp />, text: 'Improving', color: 'var(--success-color)' };
            case 'down': return { icon: <TrendingDown />, text: 'Declining', color: 'var(--danger-color)' };
            default: return { icon: null, text: 'Consistent', color: 'var(--text-secondary)' };
        }
    };

    const trendInfo = getTrendInfo();

    return (
        <motion.div className="card adherence-score-card">
            <div className="card-header">
                <Target />
                <h3>Weekly Adherence</h3>
            </div>
            <div className="score-display">
                <span className="score-percentage">{score.percentage}%</span>
                <div className="score-subtitle" style={{ color: trendInfo.color }}>
                    {trendInfo.icon}
                    <span>{trendInfo.text}</span>
                </div>
            </div>
            <p className="score-description">
                This score is based on your dose history from the last 7 days.
            </p>
        </motion.div>
    );
};

// ✅ FIXED: Added the missing default export line.
export default AdherenceScoreCard;
