import React from 'react';
import { motion } from 'framer-motion';
import './StatusHUD.css';

const StatusHUD: React.FC = () => {
  const stats = [
    { label: 'CPU_LOAD', value: 24, unit: '%' },
    { label: 'MEM_USED', value: 42, unit: '%' },
    { label: 'NET_SPEED', value: 850, unit: 'Mb/s' },
    { label: 'LATENCY', value: 12, unit: 'ms' },
  ];

  return (
    <div className="status-hud">
      <div className="status-overlay top-left">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            className="status-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="status-label">{stat.label}</div>
            <div className="status-bar-container">
              <div className="status-bar">
                <motion.div 
                  className="status-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, delay: 0.5 + 0.1 * i }}
                />
              </div>
              <span className="status-value">{stat.value}{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="status-overlay top-right">
        <motion.div 
          className="system-clock"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="time">{new Date().toLocaleTimeString([], { hour12: false })}</div>
          <div className="date">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
        </motion.div>
        <motion.div 
          className="version-tag"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ONYX_OS v6.0.2
        </motion.div>
      </div>

      <div className="scanning-lines" />
    </div>
  );
};

export default StatusHUD;
