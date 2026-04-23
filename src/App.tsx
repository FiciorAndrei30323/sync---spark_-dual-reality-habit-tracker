import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '@/src/store';
import FocusOS from '@/src/components/FocusOS';
import LifeRPG from '@/src/components/LifeRPG';
import GuildDashboard from '@/src/components/GuildDashboard';
import { Swords, Target, Users } from 'lucide-react';
import { triggerHaptic } from '@/src/lib/utils';

export default function App() {
  const { appMode, setAppMode, stats } = useAppStore();

  const handleModeChange = (mode: 'focus' | 'rpg' | 'guild') => {
    if (appMode !== mode) {
      triggerHaptic('heavy');
      setAppMode(mode);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-1000 bg-background text-foreground">
      <AnimatePresence mode="wait">
        {appMode === 'focus' ? (
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden safe-area-bottom"
          >
            <FocusOS />
          </motion.div>
        ) : appMode === 'rpg' ? (
          <motion.div
            key="rpg"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden safe-area-bottom"
          >
            <LifeRPG />
          </motion.div>
        ) : (
          <motion.div
            key="guild"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden safe-area-bottom"
          >
            <GuildDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mode Switcher */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center p-2 backdrop-blur-md rounded-full shadow-lg border border-border-subtle bg-surface-primary/90 transition-colors duration-1000"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'focus' ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-secondary hover:text-accent'}`}
        >
          <Target className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Daily Rituals</span>
        </button>
        <button
          onClick={() => handleModeChange('rpg')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'rpg' ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-secondary hover:text-accent'}`}
        >
          <Swords className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">The Orchard</span>
        </button>
        <button
          onClick={() => handleModeChange('guild')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'guild' ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-secondary hover:text-accent'}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Focus Pod</span>
        </button>
      </motion.div>
    </div>
  );
}
