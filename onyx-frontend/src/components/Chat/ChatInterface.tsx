// src/components/Chat/ChatInterface.tsx
import { useState, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { sendTask } from '@/services/api';

function ChatInterface() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: { role: 'user', content: string } = { role: 'user', content: input };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    
    // Add placeholder for assistant response
    const assistantPlaceholder: { role: 'assistant', content: string, isStreaming: boolean } = { role: 'assistant', content: '...', isStreaming: true };
    addMessage(assistantPlaceholder);
    
    try {
      // Send to backend with streaming
      const response = await sendTask(input);
      
      // Update message when done
      useChatStore.getState().updateLastMessage({
        role: 'assistant',
        content: response.result,
        isStreaming: false
      });
    } catch (error: any) {
      useChatStore.getState().updateLastMessage({
        role: 'assistant',
        content: `Error: ${error.message}`,
        isStreaming: false,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg: any, idx: number) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              } ${msg.isStreaming ? 'animate-pulse' : ''}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-800 pt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Give Onyx a task... (e.g., 'Build a chess engine')"
            className="flex-1 bg-gray-900 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-6 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
