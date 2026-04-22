import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type OnboardingPhase = 'input' | 'planted' | 'bloom';

export default function SeedToBloom() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<OnboardingPhase>('input');
  const [identityText, setIdentityText] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && identityText.trim().length > 0) {
      setPhase('planted');
    }
  };

  useEffect(() => {
    // If the seed is planted, wait a moment for the drop animation, then bloom
    if (phase === 'planted') {
      const timer = setTimeout(() => {
        setPhase('bloom');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="w-screen h-screen bg-focus-bg dark:bg-midnight-bg flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000">
      
      {/* Immersive Background */}
      <motion.div 
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] transition-colors duration-1000"
        animate={{
           background: phase === 'bloom' 
             ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)' 
             : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, rgba(0,0,0,0) 70%)'
        }}
      />

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md h-full relative px-6">
        
        {/* Typographic Prompt */}
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div
              key="prompt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/3 text-center w-full transform -translate-y-1/2"
            >
              <h1 className="text-3xl font-semibold tracking-tight text-focus-text dark:text-midnight-text">
                What defines you?
              </h1>
              <p className="mt-2 text-focus-dim dark:text-midnight-dim text-lg font-light">
                Plant the seed for your first identity.
              </p>
            </motion.div>
          )}
          {phase === 'bloom' && (
            <motion.div
              key="prompt-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/3 text-center w-full transform -translate-y-1/2"
            >
              <h1 className="text-3xl font-semibold tracking-tight text-focus-text dark:text-midnight-text">
                {identityText}
              </h1>
              <p className="mt-2 text-[#10B981] text-sm font-medium uppercase tracking-widest">
                Identity Rooted
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Seed Node / Input Element */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-center">
          <AnimatePresence mode="wait">
            {phase === 'input' && (
              <motion.div
                key="input-node"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full relative"
              >
                <div className="glass-light dark:glass-dark rounded-full p-1 mx-auto w-full transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <input 
                    type="text" 
                    value={identityText}
                    onChange={(e) => setIdentityText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g. A reader..." 
                    className="bg-transparent w-full px-6 py-4 text-center focus:outline-none text-focus-text dark:text-midnight-text placeholder:text-focus-dim/50 font-medium text-lg"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {(phase === 'planted' || phase === 'bloom') && (
              <motion.div
                key="seed-node"
                layoutId="seed-node"
                initial={{ scale: 0, y: -50 }}
                animate={{ 
                  scale: phase === 'bloom' ? [1, 1.05, 1] : 1, 
                  y: phase === 'planted' ? 100 : 100 // Drops down to 'soil'
                }}
                transition={{ 
                   y: { type: 'spring', stiffness: 200, damping: 15 },
                   scale: phase === 'bloom' ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { duration: 0.5 }
                }}
                className={`w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl transition-colors duration-1000 ${phase === 'bloom' ? 'bg-[#10B981]/20 shadow-[#10B981]/30' : 'bg-white/10 dark:bg-midnight-surface/50'}`}
              >
                {phase === 'bloom' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="w-10 h-10 rounded-full bg-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Soil Ripple Effect */}
          {phase === 'planted' && (
             <motion.div
               initial={{ scale: 0.5, opacity: 1 }}
               animate={{ scale: 3, opacity: 0 }}
               transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
               className="absolute top-[100px] w-24 h-24 border-2 border-white/30 rounded-full pointer-events-none"
             />
          )}

        </div>

        {/* Temporary Exit to App */}
        {phase === 'bloom' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={() => navigate('/')}
            className="absolute bottom-12 px-8 py-3 rounded-full text-sm font-medium bg-focus-text text-focus-surface dark:bg-midnight-text dark:text-midnight-bg hover:opacity-90 transition-opacity"
          >
            Enter Focus OS
          </motion.button>
        )}
      </div>
    </div>
  );
}
