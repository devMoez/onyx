import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatTab.css';

interface ChatTabProps {
  messages: any[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ messages, onSendMessage, isConnected }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <motion.div
      className="chat-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="chat-messages">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`message ${msg.role}`}
              initial={{ opacity: 0, x: msg.role === 'user' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="message-content"
                whileHover={{ scale: 1.02 }}
              >
                <div className="message-role">{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="message-text">{msg.content}</div>
              </motion.div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>

      <motion.div className="chat-input-area">
        <motion.div className="input-wrapper">
          <input
            type="text"
            placeholder="Type your command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!isConnected}
          />
          <motion.button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="send-button"
          >
            ➤
          </motion.button>
        </motion.div>
        <motion.div className="input-hint">
          Connected: {isConnected ? '✓' : '✗'}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChatTab;
