import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './VoiceTab.css';

interface VoiceTabProps {
  onSendMessage: (message: string) => void;
}

const VoiceTab: React.FC<VoiceTabProps> = ({ onSendMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = async () => {
    setIsListening(true);
    try {
      const response = await fetch('http://localhost:8000/api/voice/listen', {
        method: 'POST'
      });
      const data = await response.json();
      setTranscript(data.transcript);
      if (data.transcript) {
        onSendMessage(data.transcript);
      }
    } catch (error) {
      console.error('Voice listening failed:', error);
    } finally {
      setIsListening(false);
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      await fetch('http://localhost:8000/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
    } catch (error) {
      console.error('Speech failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div
      className="voice-tab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="voice-container">
        <motion.div className="voice-visual">
          {isListening && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="wave"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity 
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {transcript && (
          <motion.div
            className="transcript"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{transcript}</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div className="voice-controls">
        <motion.button
          className={`voice-button listen ${isListening ? 'active' : ''}`}
          onClick={startListening}
          disabled={isListening}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="icon">🎤</span>
          <span>{isListening ? 'Listening...' : 'Listen'}</span>
        </motion.button>

        <motion.button
          className={`voice-button speak ${isSpeaking ? 'active' : ''}`}
          onClick={() => speakText(transcript || 'Hello')}
          disabled={isSpeaking || !transcript}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="icon">🔊</span>
          <span>{isSpeaking ? 'Speaking...' : 'Speak'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default VoiceTab;
