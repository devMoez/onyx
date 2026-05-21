import { useState } from "react";
import { VoiceVisualizer } from "./components/VoiceVisualizer";
import { SystemPanel } from "./components/SystemPanel";
import { ChatMessage } from "./components/ChatMessage";
import {
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Mic,
  MicOff,
  Send,
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [messages] = useState([
    {
      id: 1,
      message: "Hello Onyx, what's the status of all systems?",
      isUser: true,
      timestamp: "10:32 AM",
    },
    {
      id: 2,
      message: "All systems are operational. CPU usage is nominal at 23%, memory at 45%, and all network connections are stable.",
      isUser: false,
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      message: "Run diagnostics on the neural network module.",
      isUser: true,
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      message: "Initiating full diagnostic scan. Neural network latency: 12ms. All pathways optimized and functioning within normal parameters.",
      isUser: false,
      timestamp: "10:33 AM",
    },
  ]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="size-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative size-full grid grid-cols-12 gap-6 p-6">
        {/* Left Panel - System Status */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-3 space-y-4"
        >
          <div className="border-b border-cyan-500/30 pb-4">
            <h2 className="text-xl font-bold text-cyan-400">SYSTEM STATUS</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time Monitoring</p>
          </div>

          <SystemPanel
            title="CPU Usage"
            value="23%"
            icon={Cpu}
            status="normal"
            delay={0.1}
          />
          <SystemPanel
            title="Memory"
            value="45%"
            icon={HardDrive}
            status="normal"
            delay={0.2}
          />
          <SystemPanel
            title="Network"
            value="Online"
            icon={Wifi}
            status="normal"
            delay={0.3}
          />
          <SystemPanel
            title="Neural Core"
            value="Active"
            icon={Activity}
            status="normal"
            delay={0.4}
          />

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg backdrop-blur-sm"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Session Info
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white">4h 23m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Commands</span>
                <span className="text-white">147</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Response Time</span>
                <span className="text-cyan-400">12ms</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Center Panel - Voice Visualizer */}
        <div className="col-span-6 flex flex-col items-center justify-between">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex items-center justify-center"
          >
            <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
          </motion.div>

          {/* Voice Controls */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-xl mb-8"
          >
            <div className="flex gap-3">
              <button
                onClick={toggleListening}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all ${
                  isListening
                    ? "bg-cyan-500 shadow-lg shadow-cyan-500/50"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a command or use voice..."
                  className="w-full h-14 px-6 bg-slate-800/50 border border-cyan-500/30 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/60 backdrop-blur-sm"
                />
              </div>

              <button className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Chat/Transcript */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-3 flex flex-col"
        >
          <div className="border-b border-cyan-500/30 pb-4 mb-4">
            <h2 className="text-xl font-bold text-cyan-400">TRANSCRIPT</h2>
            <p className="text-xs text-gray-500 mt-1">Conversation History</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <ChatMessage
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}