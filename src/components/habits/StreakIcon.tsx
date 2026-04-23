import React from 'react';
import { motion } from 'motion/react';
import { Flame, Star } from 'lucide-react';

interface StreakIconProps {
  count: number;
  isRepaired?: boolean;
  className?: string;
}

export default function StreakIcon({ count, isRepaired = false, className = "" }: StreakIconProps) {
  if (isRepaired) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Phoenix Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-repaired/30 animate-rebirth" />
        
        <div className="relative bg-gradient-to-br from-repaired to-repaired/70 p-1.5 rounded-full shadow-lg">
          <Star className="w-4 h-4 text-white fill-current" />
        </div>
        
        <span className="absolute -top-1 -right-1 bg-surface-primary text-repaired text-[10px] font-bold px-1 rounded-md shadow-sm border border-border-subtle">
          {count}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 ${className}`}>
      <Flame className="w-4 h-4 text-orange-500 fill-current" />
      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
        {count}
      </span>
    </div>
  );
}
