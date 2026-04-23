import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface ArtifactCardProps {
  name: string;
  description: string;
  isLocked: boolean;
  icon: React.ReactNode;
  className?: string;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ name, description, isLocked, icon, className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* The card content */}
      <div className={`
        glass-light dark:glass-dark rounded-3xl p-6 transition-all duration-500
        ${isLocked ? 'artifact-locked scale-95' : 'artifact-unlocked animate-gleam scale-100'}
      `}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-2xl bg-surface-secondary text-text-primary">
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-bold text-text-primary">{name}</h4>
            <p className="text-sm text-text-secondary dark:text-text-primary/70 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-full border border-white/30 shadow-xl scale-110">
            <Lock className="w-6 h-6 text-text-primary opacity-80" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactCard;
