import { motion } from "motion/react";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-600" : "bg-cyan-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-slate-800 text-gray-100 rounded-tl-sm"
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-2">{timestamp}</p>
      </div>
    </motion.div>
  );
}
