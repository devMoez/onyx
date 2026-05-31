import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TerminalTab.css';

interface TerminalTabProps {
  output: string[];
}

const TerminalTab: React.FC<TerminalTabProps> = ({ output }) => {
  return (
    <motion.div
      className="terminal-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="terminal-header">
        <div className="terminal-title">Terminal</div>
        <div className="terminal-controls">
          <motion.button whileHover={{ scale: 1.1 }} className="control-btn">⊟</motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="control-btn">□</motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="control-btn">✕</motion.button>
        </div>
      </motion.div>

      <motion.div className="terminal-output">
        <AnimatePresence>
          {output.length === 0 ? (
            <motion.div className="terminal-prompt" key="prompt">
              $ ONYX &gt; Ready for commands...
            </motion.div>
          ) : (
            output.map((line, idx) => (
              <motion.div
                key={`${idx}-${line}`}
                className="terminal-line"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="terminal-prompt">$</span>
                <span className="terminal-text">{line}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TerminalTab;
