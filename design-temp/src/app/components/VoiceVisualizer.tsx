import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function VoiceVisualizer({ isListening, isSpeaking }: VoiceVisualizerProps) {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 32 }, (_, i) => i));
  }, []);

  const active = isListening || isSpeaking;

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
        animate={{
          scale: active ? [1, 1.1, 1] : 1,
          opacity: active ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-cyan-400/40"
        animate={{
          scale: active ? [1, 1.05, 1] : 1,
          rotate: 360,
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Particle field */}
      {particles.map((i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const radius = 100;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: active
                ? Math.cos(angle) * (radius + Math.random() * 20)
                : Math.cos(angle) * radius * 0.5,
              y: active
                ? Math.sin(angle) * (radius + Math.random() * 20)
                : Math.sin(angle) * radius * 0.5,
              opacity: active ? [0.4, 1, 0.4] : 0.3,
              scale: active ? [1, 1.5, 1] : 1,
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.02,
            }}
          />
        );
      })}

      {/* Center core */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center"
        animate={{
          scale: active ? [1, 1.1, 1] : 1,
          boxShadow: active
            ? [
                "0 0 20px rgba(6, 182, 212, 0.5)",
                "0 0 40px rgba(6, 182, 212, 0.8)",
                "0 0 20px rgba(6, 182, 212, 0.5)",
              ]
            : "0 0 20px rgba(6, 182, 212, 0.5)",
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-2xl font-bold text-white">ONYX</span>
      </motion.div>

      {/* Status indicator */}
      <div className="absolute -bottom-8 text-center">
        <motion.p
          className="text-sm font-medium"
          animate={{
            color: isListening
              ? "#06b6d4"
              : isSpeaking
              ? "#3b82f6"
              : "#6b7280",
          }}
        >
          {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Standby"}
        </motion.p>
      </div>
    </div>
  );
}
