import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AuthOverlay.css';

interface AuthOverlayProps {
  onAuthenticated: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);

  const handleAuth = () => {
    // For now, any non-empty password works, or just click authenticate
    if (password === 'onyx' || password === '') {
      onAuthenticated();
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <motion.div 
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
    >
      <div className="auth-content">
        <motion.div 
          className={`auth-box ${isError ? 'auth-error' : ''}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="auth-header">
            <span className="auth-icon">🔒</span>
            SECURITY ACCESS REQUIRED
          </div>
          <div className="auth-body">
            <div className="auth-text">ONYX CORE ENCRYPTED</div>
            <div className="auth-input-group">
              <input 
                type="password" 
                className="auth-input" 
                placeholder="ACCESS KEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                autoFocus
              />
              <motion.button 
                className="auth-btn" 
                onClick={handleAuth}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,210,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                AUTHENTICATE
              </motion.button>
            </div>
            {isError && <div className="auth-error-text">ACCESS DENIED: INVALID KEY</div>}
          </div>
          <div className="auth-footer">
            IP: 192.168.1.104 | LOC: ENCRYPTED | TERM: ONYX_V6
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthOverlay;
