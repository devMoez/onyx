import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface SystemPanelProps {
  title: string;
  value: string;
  icon: LucideIcon;
  status?: "normal" | "warning" | "error";
  delay?: number;
}

export function SystemPanel({
  title,
  value,
  icon: Icon,
  status = "normal",
  delay = 0,
}: SystemPanelProps) {
  const statusColors = {
    normal: "border-cyan-500/30 bg-slate-900/50",
    warning: "border-yellow-500/30 bg-slate-900/50",
    error: "border-red-500/30 bg-slate-900/50",
  };

  const iconColors = {
    normal: "text-cyan-400",
    warning: "text-yellow-400",
    error: "text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`border rounded-lg p-4 backdrop-blur-sm ${statusColors[status]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${iconColors[status]}`} />
      </div>
    </motion.div>
  );
}
