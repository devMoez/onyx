import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatTab from '@/components/ONYX/ChatTab';
import ArtifactsTab from '@/components/ONYX/ArtifactsTab';
import TerminalTab from '@/components/ONYX/TerminalTab';
import ScreenTab from '@/components/ONYX/ScreenTab';
import VoiceTab from '@/components/ONYX/VoiceTab';
import OrbVisualization from '@/components/ONYX/OrbVisualization';
import AuthOverlay from '@/components/ONYX/AuthOverlay';
import SettingsOverlay from '@/components/ONYX/SettingsOverlay';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'hud' | 'chat' | 'artifacts' | 'terminal' | 'screen' | 'voice'>('hud');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [artifacts] = useState<any[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['CORE INITIALIZED.', 'READY.']);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const connect = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/stream');
      
      socket.onopen = () => {
        setTerminalOutput(prev => [...prev, '✓ Neural link established']);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'task_result') {
          const result = message.data;
          setIsProcessing(false);
          
          if (result.status === 'completed') {
            const assistantMsg = { 
              id: Date.now().toString(), 
              role: 'assistant', 
              content: result.response, 
              timestamp: new Date().toISOString() 
            };
            setMessages(prev => [...prev, assistantMsg]);
            setTerminalOutput(prev => [...prev, '✓ Swarm task finalized.']);
          } else {
            // Precise Error Handling for User Feedback
            let userFeedback = `✖ SYSTEM ERROR: ${result.error}`;
            
            if (result.error?.toLowerCase().includes('quota')) {
              userFeedback = "⚠️ QUOTA EXCEEDED: Your LLM provider has reached its limit. Please switch providers or check your billing.";
            } else if (result.error?.toLowerCase().includes('auth') || result.error?.toLowerCase().includes('authorized')) {
              userFeedback = "🔒 AUTHENTICATION REQUIRED: Please authorize your CLI or update your API keys in Settings.";
            } else if (result.error?.toLowerCase().includes('timeout') || result.error?.toLowerCase().includes('refused')) {
              userFeedback = "📡 CONNECTION FAILURE: Could not reach the LLM server. Checking neural link...";
            }

            const errorMsg = {
              id: Date.now().toString(),
              role: 'assistant',
              content: userFeedback,
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
            setTerminalOutput(prev => [...prev, `✖ Error detected: ${result.error}`]);
          }
        }
      };

      socket.onclose = () => {
        setTerminalOutput(prev => [...prev, '! Neural link lost. Reconnecting...']);
        setTimeout(connect, 3000);
      };

      socketRef.current = socket;
    };

    connect();
    return () => socketRef.current?.close();
  }, [isAuthenticated]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !socketRef.current) return;
    
    setIsProcessing(true);
    
    // Add user message locally
    const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setTerminalOutput(prev => [...prev, `$ ${content}`, '... routing to swarm orchestrator']);

    // Send to backend
    socketRef.current.send(JSON.stringify({
      type: 'task',
      input: content
    }));
  };

  const closeOverlay = () => setActiveView('hud');

  // Keyboard Shortcuts (Standard HUD Logic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'v') setIsListening(!isListening);
      else if (key === 'c') setActiveView(prev => prev === 'chat' ? 'hud' : 'chat');
      else if (key === 'a') setActiveView(prev => prev === 'artifacts' ? 'hud' : 'artifacts');
      else if (key === 't') setActiveView(prev => prev === 'terminal' ? 'hud' : 'terminal');
      else if (key === 's') setActiveView(prev => prev === 'screen' ? 'hud' : 'screen');
      else if (key === 'l') setIsSettingsOpen(!isSettingsOpen);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isSettingsOpen]);

  return (
    <div className="app-container">
      <AnimatePresence>
        {!isAuthenticated && (
          <AuthOverlay onAuthenticated={() => setIsAuthenticated(true)} />
        )}
      </AnimatePresence>

      <motion.div 
        className="app" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: isAuthenticated ? 1 : 0 }} 
        transition={{ duration: 1.5 }}
      >
        <main className="content">
          {/* THE ORB - Centered HUD background */}
          <OrbVisualization 
            isListening={isListening}
            isProcessing={isProcessing}
            onMicToggle={() => setIsListening(!isListening)}
            activeTab={activeView}
            onTabChange={(tab: any) => setActiveView(tab)}
            onSettingsToggle={() => setIsSettingsOpen(true)}
          />

          {/* Settings Overlay */}
          <AnimatePresence>
            {isSettingsOpen && (
              <SettingsOverlay onClose={() => setIsSettingsOpen(false)} />
            )}
          </AnimatePresence>

          {/* Functional Overlays (Pop-up windows) */}
          <AnimatePresence>
            {activeView !== 'hud' && (
              <motion.div 
                className="overlay-view"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              >
                <div className="overlay-header">
                  <div className="overlay-title">{activeView.toUpperCase()}</div>
                  <button className="close-btn" onClick={closeOverlay}>×</button>
                </div>
                <div className="overlay-content no-scrollbar">
                  {activeView === 'chat' && (
                    <ChatTab 
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isConnected={!!socketRef.current}
                    />
                  )}
                  {activeView === 'artifacts' && (
                    <ArtifactsTab artifacts={artifacts} />
                  )}
                  {activeView === 'terminal' && (
                    <TerminalTab output={terminalOutput} />
                  )}
                  {activeView === 'screen' && (
                    <ScreenTab />
                  )}
                  {activeView === 'voice' && (
                    <VoiceTab onSendMessage={handleSendMessage} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <div className="app-footer">
          <span className="system-stat">CORE: ACTIVE | SWARM: READY</span>
          <div className="mode-indicator">AUTO MODE</div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
