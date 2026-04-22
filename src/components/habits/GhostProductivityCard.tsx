import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, X } from 'lucide-react';

interface GhostProductivityCardProps {
  habitName: string;
  isVisible: boolean;
  onArchive: () => void;
  onDismiss: () => void;
}

export default function GhostProductivityCard({ habitName, isVisible, onArchive, onDismiss }: GhostProductivityCardProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
          exit={{ opacity: 0, height: 0, marginTop: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="glass-light dark:glass-dark rounded-2xl p-6 relative flex flex-col gap-4 shadow-lg border border-white/40 dark:border-white/10">
            {/* Soft decorative blur */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-focus-text dark:text-midnight-text font-medium text-lg leading-snug">
                Your routines are evolving.
              </h3>
              <p className="text-focus-dim dark:text-midnight-dim text-sm mt-1 max-w-[90%] font-light leading-relaxed">
                <span className="font-medium">"{habitName}"</span> doesn't seem to fit your life right now, and that’s perfectly okay. Give yourself permission to let it go.
              </p>
            </div>

            <div className="flex items-center justify-between mt-2 relative z-10">
              <button 
                onClick={onDismiss}
                className="text-xs text-focus-dim hover:text-focus-text dark:text-midnight-dim dark:hover:text-midnight-text transition-colors font-medium px-2 py-1"
              >
                Keep trying
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onArchive}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20 border border-white/60 dark:border-white/10 text-focus-text dark:text-midnight-text text-sm font-medium transition-colors shadow-sm"
              >
                <Archive className="w-4 h-4" />
                Archive Gracefully
              </motion.button>
            </div>
            
            <button 
              onClick={onDismiss}
              className="absolute top-4 right-4 text-focus-dim/50 hover:text-focus-dim transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
