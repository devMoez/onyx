import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ArtifactsTab.css';

interface ArtifactsTabProps {
  artifacts: any[];
}

const ArtifactsTab: React.FC<ArtifactsTabProps> = ({ artifacts }) => {
  return (
    <motion.div
      className="artifacts-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="artifacts-grid">
        <AnimatePresence>
          {artifacts.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">📦</div>
              <p>No artifacts generated yet</p>
            </motion.div>
          ) : (
            artifacts.map((artifact, idx) => (
              <motion.div
                key={artifact.id || idx}
                className="artifact-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div className="artifact-header">
                  <span className="artifact-icon">
                    {artifact.type === 'code' ? '💻' : artifact.type === 'image' ? '🖼️' : '📄'}
                  </span>
                  <span className="artifact-type">{artifact.type}</span>
                </motion.div>
                <motion.div className="artifact-content">
                  {artifact.content.substring(0, 200)}...
                </motion.div>
                <motion.button
                  className="artifact-preview"
                  whileHover={{ backgroundColor: '#4CAF50' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Preview
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ArtifactsTab;
