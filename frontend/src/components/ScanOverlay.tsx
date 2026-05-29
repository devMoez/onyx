import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ScanOverlay.css';

const ScanOverlay: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div 
          className="scan-overlay"
          initial={{ top: '-100%' }}
          animate={{ top: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "linear" }}
        >
          <div className="scan-line" />
          <div className="scan-data">
            <span>SCANNING CORE...</span>
            <span>ENCRYPTION: 1024-BIT</span>
            <span>STATUS: OPTIMAL</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanOverlay;
