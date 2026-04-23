import { useAppStore, Habit, RoutineType, ResourceType } from '@/src/store';
import { triggerHaptic, triggerConfetti, cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Moon, Sun, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';

function parseInputForHabit(input: string): { title: string, routine: RoutineType, resource: ResourceType } {
  const lower = input.toLowerCase();
  
  let routine: RoutineType = 'anytime';
  if (lower.includes('morning') || lower.includes('am ') || lower.includes('breakfast')) routine = 'morning';
  if (lower.includes('afternoon') || lower.includes('lunch')) routine = 'afternoon';
  if (lower.includes('evening') || lower.includes('night') || lower.includes('pm ') || lower.includes('bed')) routine = 'evening';

  let resource: ResourceType = 'focus';
  if (lower.includes('workout') || lower.includes('run') || lower.includes('gym')) resource = 'strength';
  if (lower.includes('read') || lower.includes('study') || lower.includes('learn')) resource = 'intelligence';
  if (lower.includes('water') || lower.includes('sleep') || lower.includes('meditate')) resource = 'vitality';

  return { title: input, routine, resource }; // keeping original case for title
}

export default function FocusOS() {
  const { habits, toggleHabitCompletion, addHabit, gainXp } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      triggerHaptic('success');
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
      gainXp(50); // reward Pomodoro completion
      setIsTimerRunning(false);
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, gainXp]);

  const toggleTimer = () => {
    triggerHaptic('light');
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    triggerHaptic('light');
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  // Spring physics for list interactions
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  const handleComplete = (id: string, e: React.MouseEvent) => {
    const isCompleted = habits.find(h => h.id === id)?.completions.some(c => c.date === today);
    toggleHabitCompletion(id, today);
    
    if (!isCompleted) {
      triggerHaptic('heavy');
      triggerConfetti(e.clientX, e.clientY);
    } else {
      triggerHaptic('light');
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const parsed = parseInputForHabit(newTitle.trim());
      addHabit(parsed.title, parsed.resource, parsed.routine);
      setNewTitle('');
      setIsAdding(false);
      triggerHaptic('light');
    }
  };

  const todayHabits = habits.filter(h => !h.completions.some(c => c.date === today));
  const completedHabits = habits.filter(h => h.completions.some(c => c.date === today));

  const routines = [
    { type: 'morning', icon: <Sun className="w-5 h-5 text-pillar-work" />, label: 'Morning Ritual' },
    { type: 'afternoon', icon: <Clock className="w-5 h-5 text-text-secondary" />, label: 'Afternoon Focus' },
    { type: 'evening', icon: <Moon className="w-5 h-5 text-pillar-mind" />, label: 'Evening Wind-down' },
    { type: 'anytime', icon: <Plus className="w-5 h-5 text-pillar-health" />, label: 'Anytime' }
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-12 w-full max-w-2xl mx-auto min-h-screen flex flex-col pt-12 safe-area-bottom gap-10">
      
      {/* Header & Date */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif italic text-text-primary tracking-tight">Focus.</h1>
          <p className="text-text-secondary font-medium text-sm mt-1">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        
        {/* Deep Focus Timer UI */}
        <div className="flex items-center gap-3 bg-surface-primary border border-border-subtle px-4 py-2 rounded-[24px] shadow-sm">
          <div className="font-mono text-xl text-text-primary font-bold w-[60px] text-center">
            {formatTime(timeLeft)}
          </div>
          <div className="w-[1px] h-6 bg-border-subtle"></div>
          <button onClick={toggleTimer} className="text-accent hover:opacity-80 transition-opacity p-1">
            {isTimerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          {!isTimerRunning && timeLeft < 25*60 && (
            <button onClick={resetTimer} className="text-text-secondary hover:opacity-80 p-1">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {routines.map(routine => {
          const acts = todayHabits.filter(h => (h.routine || 'anytime') === routine.type);
          if (acts.length === 0) return null;

          return (
            <div key={routine.type} className="space-y-4">
              <div className="flex items-center gap-2">
                {routine.icon}
                <h3 className="font-serif text-lg text-text-primary italic">{routine.label}</h3>
              </div>
              <AnimatePresence mode="popLayout">
                {acts.map(habit => (
                  <motion.button
                    layout
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={springTransition}
                    key={habit.id}
                    onClick={(e) => handleComplete(habit.id, e)}
                    className="w-full group text-left bg-surface-primary border border-border-subtle p-5 rounded-3xl flex items-center justify-between hover:border-accent transition-all shadow-sm"
                  >
                    <span className="text-lg font-medium text-text-primary truncate px-2">{habit.title}</span>
                    <div className="w-8 h-8 rounded-full border-2 border-border-subtle group-hover:border-accent transition-colors flex items-center justify-center relative overflow-hidden">
                      <motion.div 
                         initial={{ scale: 0 }}
                         whileHover={{ scale: 1 }}
                         className="absolute inset-0 bg-accent/20 rounded-full"
                      />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          );
        })}

        {todayHabits.length === 0 && (
          <motion.div layout className="text-center py-12 text-text-secondary font-serif italic text-lg">
            All intentions fulfilled. Your mind is clear.
          </motion.div>
        )}
      </div>

      {completedHabits.length > 0 && (
        <div className="space-y-3 mt-4 pt-10 border-t border-border-subtle/50">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-bold mb-4">Completed</h3>
          <AnimatePresence mode="popLayout">
            {completedHabits.map(habit => (
              <motion.button
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 0.6, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springTransition}
                key={habit.id}
                onClick={(e) => handleComplete(habit.id, e)}
                className="w-full text-left bg-transparent p-4 rounded-2xl flex items-center justify-between overflow-hidden"
              >
                <span className="text-md font-medium text-text-secondary line-through">{habit.title}</span>
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.form 
            layout
            key="add-form"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onSubmit={handleAdd} 
            className="mt-4 relative"
          >
            <input 
              autoFocus
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. 'Morning run' or 'Read 20 pages'"
              className="w-full bg-surface-primary border border-border-subtle text-text-primary p-6 rounded-[32px] shadow-sm outline-none focus:border-accent transition-colors pr-16 font-medium placeholder:text-text-secondary/50 text-lg"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-2xl font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            layout
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdding(true)}
            className="mt-4 mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-surface-primary border border-border-subtle text-text-secondary shadow-sm hover:text-accent hover:border-accent hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
