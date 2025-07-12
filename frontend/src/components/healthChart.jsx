import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
          backgroundColor: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          padding: '0.5rem 1rem',
          borderRadius: '0.75rem',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <p className="label" style={{fontWeight: 600, marginBottom: '0.5rem'}}>{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        {payload.map((p, i) => (
             <p key={i} className="intro" style={{color: p.color}}>{`${p.name} : ${p.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};


const HealthChart = ({ data, lines }) => {
  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if there's enough data for at least one line
  const hasEnoughData = lines.some(line => data.filter(item => item[line.dataKey] != null && item[line.dataKey] !== '').length >= 2);

  if (!hasEnoughData) {
    return (
        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <p style={{ color: 'var(--text-secondary)' }}>Not enough data to display chart.</p>
        </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5, }}
        >
          <defs>
            {lines.map(line => (
                <linearGradient key={line.dataKey} id={`color${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--border-color')} />
          <XAxis dataKey="log_date" tickFormatter={formatXAxis} stroke="var(--text-secondary)" fontSize={12} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          {lines.map(line => (
            <React.Fragment key={line.dataKey}>
                <Area type="monotone" dataKey={line.dataKey} stroke="none" fillOpacity={1} fill={`url(#color${line.dataKey})`} />
                <Line type="monotone" dataKey={line.dataKey} name={line.name} stroke={line.color} strokeWidth={2} activeDot={{ r: 6 }} dot={false} />
            </React.Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
