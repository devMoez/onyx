import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatTab from './components/ChatTab';
import ArtifactsTab from './components/ArtifactsTab';
import TerminalTab from './components/TerminalTab';
import ScreenTab from './components/ScreenTab';
import VoiceTab from './components/VoiceTab';
import OrbVisualization from './components/OrbVisualization';
import AuthOverlay from './components/AuthOverlay';
import SettingsOverlay from './components/SettingsOverlay';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'hud' | 'chat' | 'artifacts' | 'terminal' | 'screen' | 'voice'>('hud');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [artifacts] = useState<any[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['READY.']);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const connect = () => {
      const socket = new WebSocket('ws://localhost:8000/ws/stream');
      
      socket.onopen = () => {
        setTerminalOutput(prev => [...prev, '✓ Neural link established']);
        socket.send(JSON.stringify({ type: 'ping' }));
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
            setTerminalOutput(prev => [...prev, '✓ Task completed']);
          } else {
            setTerminalOutput(prev => [...prev, `✖ Error: ${result.error}`]);
          }
        }
      };

      socket.onclose = () => {
        setTerminalOutput(prev => [...prev, '! Connection lost. Retrying...']);
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
    setTerminalOutput(prev => [...prev, `$ ${content}`, '... processing via neural router']);

    // Send to backend
    socketRef.current.send(JSON.stringify({
      type: 'task',
      input: content
    }));
  };

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
          <OrbVisualization 
            isListening={isListening}
            isProcessing={isProcessing}
            onMicToggle={() => setIsListening(!isListening)}
            activeTab={activeView}
            onTabChange={(tab: any) => setActiveView(tab)}
            onSettingsToggle={() => setIsSettingsOpen(true)}
          />

          <AnimatePresence>
            {isSettingsOpen && (
              <SettingsOverlay onClose={() => setIsSettingsOpen(false)} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeView !== 'hud' && (
              <motion.div 
                className="overlay-view"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
              >
                <div className="overlay-header">
                  <div className="overlay-title">{activeView.toUpperCase()}</div>
                  <button className="close-btn" onClick={() => setActiveView('hud')}>×</button>
                </div>
                <div className="overlay-content no-scrollbar">
                  {activeView === 'chat' && (
                    <ChatTab 
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      isConnected={true}
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
          <span className="system-stat">MODELS_ACTIVE: GITHUB_COPILOT | GOOGLE_GEMINI</span>
          <div className="mode-indicator">AUTO MODE</div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
