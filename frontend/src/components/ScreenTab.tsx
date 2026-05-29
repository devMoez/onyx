import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ScreenTab.css';

const ScreenTab: React.FC = () => {
  const [screenData, setScreenData] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreen = async () => {
    setIsCapturing(true);
    try {
      const response = await fetch('http://localhost:8000/api/screen/capture');
      const data = await response.json();
      setScreenData(data.image_base64);
    } catch (error) {
      console.error('Screen capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(captureScreen, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="screen-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="screen-container">
        {screenData ? (
          <motion.img
            src={`data:image/png;base64,${screenData}`}
            alt="Screen"
            className="screen-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div className="screen-placeholder">
            <motion.div
              animate={{ rotate: isCapturing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isCapturing ? Infinity : 0 }}
              className="loading-spinner"
            >
              📹
            </motion.div>
            <p>{isCapturing ? 'Capturing...' : 'Click to capture'}</p>
          </motion.div>
        )}
      </motion.div>

      <motion.button
        className="capture-button"
        onClick={captureScreen}
        disabled={isCapturing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCapturing ? '⏳ Capturing...' : '📸 Capture Screen'}
      </motion.button>
    </motion.div>
  );
};

export default ScreenTab;
