// frontend/src/components/HealthChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HealthChart = ({ data, dataKey, name, color }) => {
  // Format date for the X-axis tooltip
  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chart-container">
      <h4>{name} Trend</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="log_date" tickFormatter={formatXAxis} stroke="#64748b" />
          <YAxis stroke="#64748b" allowDecals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(5px)',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              color: '#1e293b'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
