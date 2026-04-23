import React from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { FileDown, CheckCircle2, ChevronRight } from 'lucide-react';

interface MetaBlockProps {
  isVisible: boolean;
  anchorHabitName: string;
  chainedHabitName: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function MetaBlock({ isVisible, anchorHabitName, chainedHabitName, onAccept, onDismiss }: MetaBlockProps) {
  // Swipe to log mechanics
  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // If swiped right far enough or fast enough
    if (offset > 100 || velocity > 500) {
      await controls.start({ x: '100%', opacity: 0, transition: { duration: 0.2 } });
      onAccept();
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
        >
          <div className="glass-light dark:glass-dark rounded-2xl p-1 shadow-2xl pointer-events-auto border border-white/40 dark:border-white/10 overflow-hidden relative group">
            
            {/* The animated pulse thread connection background */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#3B82F6] to-transparent opacity-50"
              initial={{ y: '-100%' }}
              animate={{ y: '200%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            <div className="p-4 relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-pillar-health" />
                <span>{anchorHabitName} Logged. Next up:</span>
              </div>
              
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary font-semibold text-lg">
                  {chainedHabitName}
                </h4>
              </div>

              {/* Swipe-to-log area */}
              <div className="relative h-12 bg-surface-secondary/50 rounded-xl overflow-hidden flex items-center justify-center mt-2">
                <div className="absolute inset-x-0 flex items-center justify-center opacity-40 text-sm font-medium text-text-primary">
                  Swipe to complete <ChevronRight className="w-4 h-4 ml-1" />
                </div>
                
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0, right: 0.8 }}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                  className="absolute left-1 h-10 w-10 bg-surface-primary shadow-sm rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border border-border-subtle"
                >
                  <ChevronRight className="w-5 h-5 text-text-primary" />
                </motion.div>
                
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-pillar-work/20 origin-left"
                  style={{ width: '100%' }}
                  initial={{ scaleX: 0 }}
                  whileDrag={{ scaleX: 1, transition: { duration: 0.1 } }}
                />
              </div>
            </div>
            
            <button 
              onClick={onDismiss}
              className="absolute top-3 right-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
