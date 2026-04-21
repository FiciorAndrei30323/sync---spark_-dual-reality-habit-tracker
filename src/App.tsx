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

  useEffect(() => {
    // Apply body class for theme transitions
    document.body.classList.remove('rpg-mode', 'theme-midnight', 'theme-emerald');
    
    if (appMode === 'rpg' || appMode === 'guild') {
      document.body.classList.add('rpg-mode');
    }
    
    if (stats.activeTheme === 'midnight') document.body.classList.add('theme-midnight');
    if (stats.activeTheme === 'emerald') document.body.classList.add('theme-emerald');
    
  }, [appMode, stats.activeTheme]);

  const handleModeChange = (mode: 'focus' | 'rpg' | 'guild') => {
    if (appMode !== mode) {
      triggerHaptic('heavy');
      setAppMode(mode);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-1000 ${stats.activeTheme === 'midnight' ? 'bg-[#121212]' : stats.activeTheme === 'emerald' ? 'bg-[#0A1A12]' : 'bg-[#FDFCF8]'}`}>
      <AnimatePresence mode="wait">
        {appMode === 'focus' ? (
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full absolute inset-0"
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
            className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden pb-32"
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
            className="w-full absolute inset-0 overflow-y-auto overflow-x-hidden pb-32"
          >
            <GuildDashboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mode Switcher */}
      <motion.div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center p-2 backdrop-blur-md rounded-full shadow-lg border transition-colors duration-1000 ${stats.activeTheme === 'midnight' || stats.activeTheme === 'emerald' ? 'bg-[#1C1C1C]/80 border-white/10' : 'bg-[#FDFCF8]/90 border-[#E5E2D9]'}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'focus' ? 'bg-[#4F6D44] text-white shadow-sm shadow-[#4F6D44]/20' : 'text-[#8C8A82] hover:text-[#4F6D44]'}`}
        >
          <Target className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Daily Rituals</span>
        </button>
        <button
          onClick={() => handleModeChange('rpg')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'rpg' ? 'bg-[#4F6D44] text-white shadow-sm shadow-[#4F6D44]/20' : 'text-[#8C8A82] hover:text-[#4F6D44]'}`}
        >
          <Swords className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">The Orchard</span>
        </button>
        <button
          onClick={() => handleModeChange('guild')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${appMode === 'guild' ? 'bg-[#4F6D44] text-white shadow-sm shadow-[#4F6D44]/20' : 'text-[#8C8A82] hover:text-[#4F6D44]'}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Focus Pod</span>
        </button>
      </motion.div>
    </div>
  );
}
