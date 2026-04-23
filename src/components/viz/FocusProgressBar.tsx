import React from 'react';
import { motion } from 'motion/react';

interface FocusProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  className?: string;
}

export default function FocusProgressBar({ progress, color = "#10B981", className = "" }: FocusProgressBarProps) {
  return (
    <div className={`w-full h-3 bg-surface-secondary rounded-full overflow-hidden border border-border-subtle/30 shadow-inner ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.4)'
        }}
        className="h-full rounded-full relative"
      >
        {/* Shine highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-full" />
      </motion.div>
    </div>
  );
}
