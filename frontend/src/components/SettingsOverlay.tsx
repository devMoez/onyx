import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './SettingsOverlay.css';

interface SettingsOverlayProps {
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const [apiKeys, setApiKeys] = useState({
    deepseek: '',
    claude: '',
    gemini: '',
    openai: '',
  });
  const [activeProvider, setActiveProvider] = useState('copilot');

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const applyChanges = async () => {
    try {
      // 1. Update keys
      await fetch('http://localhost:8000/api/config/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: apiKeys })
      });
      // 2. Set provider
      await fetch('http://localhost:8000/api/config/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider })
      });
      onClose();
    } catch (err) {
      console.error('Failed to apply settings:', err);
    }
  };

  const triggerCopilotAuth = async () => {
    await fetch('http://localhost:8000/api/auth/copilot', { method: 'POST' });
    setActiveProvider('copilot');
  };

  const triggerGeminiAuth = async () => {
    await fetch('http://localhost:8000/api/auth/gemini', { method: 'POST' });
    setActiveProvider('gemini_cli');
  };

  return (
    <motion.div className="settings-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="settings-glass" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div className="settings-header">
          <div className="settings-title">CONFIGURE LLM_OS</div>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-body no-scrollbar">
          <section className="settings-section">
            <h3 className="section-label">CLI_AUTHENTICATION (PRIMARY)</h3>
            <p className="section-desc">Authorization will open in a new terminal window.</p>
            
            <div className="cli-grid">
              <button 
                className={`cli-auth-btn ${activeProvider === 'copilot' ? 'active' : ''}`}
                onClick={triggerCopilotAuth}
              >
                <div className="btn-glow" />
                <span className="btn-icon">🐙</span>
                <div className="btn-text">
                  <span className="btn-primary">COPILOT CLI</span>
                  <span className="btn-secondary">{activeProvider === 'copilot' ? 'SELECTED' : 'AUTHORIZE'}</span>
                </div>
              </button>

              <button 
                className={`cli-auth-btn ${activeProvider === 'gemini_cli' ? 'active' : ''}`}
                onClick={triggerGeminiAuth}
              >
                <div className="btn-glow" />
                <span className="btn-icon">♊</span>
                <div className="btn-text">
                  <span className="btn-primary">GEMINI CLI</span>
                  <span className="btn-secondary">{activeProvider === 'gemini_cli' ? 'SELECTED' : 'AUTHORIZE'}</span>
                </div>
              </button>
            </div>
          </section>

          <div className="divider" />

          <section className="settings-section">
            <h3 className="section-label">API_PROVIDER (FALLBACK)</h3>
            <div className="api-key-inputs">
              {[
                { id: 'deepseek', label: 'DEEPSEEK', placeholder: 'sk-...' },
                { id: 'claude', label: 'CLAUDE', placeholder: 'sk-ant-...' },
                { id: 'openai', label: 'OPENAI', placeholder: 'sk-...' },
                { id: 'gemini', label: 'GEMINI API', placeholder: 'AIza...' },
              ].map((key) => (
                <div key={key.id} className={`input-group ${activeProvider === key.id ? 'selected' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>{key.label}</label>
                    <button 
                      onClick={() => setActiveProvider(key.id)}
                      className="select-provider-btn"
                    >
                      {activeProvider === key.id ? '● ACTIVE' : 'SELECT'}
                    </button>
                  </div>
                  <input 
                    type="password" 
                    className="key-input"
                    placeholder={key.placeholder}
                    value={(apiKeys as any)[key.id]}
                    onChange={(e) => handleKeyChange(key.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <div className="system-tag">ONYX_V6_CORE</div>
          <button className="save-btn" onClick={applyChanges}>APPLY_CHANGES</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsOverlay;
