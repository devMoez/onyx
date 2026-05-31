import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
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
    cloudflare_token: '',
    cloudflare_account_id: '',
  });
  
  const [modelOverrides, setModelOverrides] = useState<Record<string, string>>({
    deepseek: 'deepseek-chat',
    claude: 'claude-3-5-sonnet-20240620',
    gemini: 'gemini-1.5-flash',
    openai: 'gpt-4o',
    cloudflare: '@cf/meta/llama-3-8b-instruct',
  });
  const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({});
  const [activeProvider, setActiveProvider] = useState('copilot');
  const [authStatus, setAuthStatus] = useState({ copilot: false });

  // Fetch auth status and available models
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('http://localhost:8000/api/auth/status');
        setAuthStatus(await authRes.json());
        
        // Fetch models for all API providers
        const providers = ['openai', 'claude', 'deepseek', 'gemini', 'cloudflare'];
        const modelData: Record<string, string[]> = {};
        for (const p of providers) {
          const res = await fetch(`http://localhost:8000/api/models/${p}`);
          const data = await res.json();
          modelData[p] = data.models;
        }
        setAvailableModels(modelData);
      } catch (e) { console.error('Fetch failed', e); }
    };
    fetchData();
  }, []);

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const applyChanges = async () => {
    try {
      await fetch('http://localhost:8000/api/config/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: apiKeys, models: modelOverrides })
      });
      await fetch('http://localhost:8000/api/config/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider })
      });
      onClose();
    } catch (err) { console.error('Failed to apply settings:', err); }
  };

  const triggerCopilotAuth = async () => {
    await fetch('http://localhost:8000/api/auth/copilot', { method: 'POST' });
  };

  const providers = [
    { id: 'copilot', name: 'GITHUB COPILOT', icon: '🐙', isAuthed: authStatus.copilot, type: 'cli' },
    { id: 'gemini_cli', name: 'GOOGLE GEMINI CLI', icon: '♊', isAuthed: false, type: 'cli' },
    { id: 'deepseek', name: 'DEEPSEEK', type: 'api', hasKey: !!apiKeys.deepseek },
    { id: 'claude', name: 'CLAUDE', type: 'api', hasKey: !!apiKeys.claude },
    { id: 'openai', name: 'OPENAI', type: 'api', hasKey: !!apiKeys.openai },
    { id: 'gemini', name: 'GEMINI API', type: 'api', hasKey: !!apiKeys.gemini },
    { id: 'cloudflare', name: 'CLOUDFLARE AI', type: 'api', hasKey: !!apiKeys.cloudflare_token },
  ];

  return (
    <motion.div className="settings-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="settings-glass" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
        <div className="settings-header">
          <div className="settings-title">SYSTEM_CONFIGURATION</div>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-body no-scrollbar">
          <section className="settings-section">
            <h3 className="section-label">PROVIDER_SELECTION</h3>
            <div className="provider-grid">
              {providers.map((p) => {
                const isActive = activeProvider === p.id;
                const isConfigured = p.type === 'cli' ? p.isAuthed : p.hasKey;

                return (
                  <button
                    key={p.id}
                    className={`provider-card ${isActive ? 'active' : ''}`}
                    onClick={() => p.type === 'cli' && !p.isAuthed ? triggerCopilotAuth() : setActiveProvider(p.id)}
                  >
                    <div className="provider-status">
                      {isActive ? <CheckCircle2 size={16} className="text-accent" /> : (isConfigured ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} />)}
                    </div>
                    {p.icon && <span className="provider-icon">{p.icon}</span>}
                    
                    <div className="provider-info">
                      <span className="provider-name">{p.name}</span>
                      {p.isAuthed !== undefined && (
                        <span className={`auth-status ${p.isAuthed ? 'authed' : 'unauthed'}`}>
                          {p.isAuthed ? '● AUTHENTICATED' : '○ CLICK TO AUTH'}
                        </span>
                      )}
                      
                      {p.type === 'api' && (
                        <div className="input-row">
                          <select 
                            className="provider-model-select" 
                            value={modelOverrides[p.id] || ''} 
                            onChange={(e) => setModelOverrides(prev => ({...prev, [p.id]: e.target.value}))}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(availableModels[p.id] || ['default']).map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          
                          {p.id === 'cloudflare' ? (
                            <>
                              <input type="password" className="provider-key-input" placeholder="Token" value={apiKeys.cloudflare_token} onChange={(e) => handleKeyChange('cloudflare_token', e.target.value)} onClick={(e) => e.stopPropagation()} />
                              <input type="password" className="provider-key-input" placeholder="Account ID" value={apiKeys.cloudflare_account_id} onChange={(e) => handleKeyChange('cloudflare_account_id', e.target.value)} onClick={(e) => e.stopPropagation()} />
                            </>
                          ) : (
                            <input type="password" className="provider-key-input" placeholder="Enter API Key" value={(apiKeys as any)[p.id]} onChange={(e) => handleKeyChange(p.id, e.target.value)} onClick={(e) => e.stopPropagation()} />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <div className="system-tag">{activeProvider.toUpperCase()} ACTIVE</div>
          <button className="save-btn" onClick={applyChanges}>APPLY_CHANGES</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsOverlay;
