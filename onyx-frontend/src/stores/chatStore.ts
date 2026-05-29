import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateLastMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message) => set((state) => {
    const newMessages = [...state.messages];
    if (newMessages.length > 0) {
      newMessages[newMessages.length - 1] = message;
    }
    return { messages: newMessages };
  }),
}));
