import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, differenceInDays } from 'date-fns';

export type ResourceType = 'strength' | 'intelligence' | 'vitality' | 'focus';
export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type CompletionStatus = 'completed' | 'repaired';

export interface Completion {
  date: string; // YYYY-MM-DD
  status: CompletionStatus;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string; // ISO date
  completions: Completion[];
  resourceReward: ResourceType;
  baseXp: number;
  routine: RoutineType;
  triggerHabitId?: string; // Stacking logic link
}

export interface UserStats {
  level: number;
  xp: number;
  maxXp: number;
  phoenixFreezes: number; // For "The Phoenix Protocol"
  gold: number;
  resources: Record<ResourceType, number>;
  pomodorosCompleted: number;
  unlockedBadges: string[];
  activeTheme: 'natural' | 'midnight' | 'emerald';
  vanguardRewardClaimed: boolean;
}

export interface GuildEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface GuildSettings {
  name: string;
  icon: string;
  color: string;
  fontColor?: string;
  fontSize?: string;
  events: GuildEvent[];
}

interface AppState {
  appMode: 'focus' | 'rpg' | 'guild';
  habits: Habit[];
  stats: UserStats;
  guild: GuildSettings;
  
  toggleAppMode: () => void;
  addHabit: (title: string, resourceReward: ResourceType, routine: RoutineType) => void;
  toggleHabitCompletion: (id: string, date: string) => (() => void) | void;
  repairStreak: (habitId: string, missingDate: string) => void;
  gainXp: (amount: number, reason?: string) => void;
  buyPhoenixCharge: () => void;
  setAppMode: (mode: 'focus' | 'rpg' | 'guild') => void;
  completePomodoro: () => void;
  checkAchievements: () => void;
  buyTheme: (theme: 'midnight' | 'emerald', cost: number) => void;
  setTheme: (theme: 'natural' | 'midnight' | 'emerald') => void;
  updateGuildSettings: (settings: Partial<GuildSettings>) => void;
  addGuildEvent: (event: Omit<GuildEvent, 'id'>) => void;
  removeGuildEvent: (id: string) => void;
  claimVanguardReward: () => void;
}

const INITIAL_STATS: UserStats = {
  level: 1,
  xp: 0,
  maxXp: 100,
  phoenixFreezes: 2, // Start with 2 streak repairs
  gold: 0,
  resources: {
    strength: 0,
    intelligence: 0,
    vitality: 0,
    focus: 0
  },
  pomodorosCompleted: 0,
  unlockedBadges: ['first_seed'],
  activeTheme: 'natural',
  vanguardRewardClaimed: false
};

const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Morning Workout (30m)',
    createdAt: new Date().toISOString(),
    completions: [],
    resourceReward: 'strength',
    baseXp: 20,
    routine: 'morning',
  },
  {
    id: '2',
    title: 'Read 20 pages',
    createdAt: new Date().toISOString(),
    completions: [],
    resourceReward: 'intelligence',
    baseXp: 15,
    routine: 'evening',
  },
  {
    id: '3',
    title: 'Deep Work Block (2h)',
    createdAt: new Date().toISOString(),
    completions: [],
    resourceReward: 'focus',
    baseXp: 30,
    routine: 'afternoon',
  }
];

const INITIAL_GUILD: GuildSettings = {
  name: 'The Night Owls',
  icon: 'users',
  color: 'bg-rpg-surface',
  fontColor: 'text-rpg-text',
  fontSize: 'text-4xl',
  events: [
    {
      id: 'mock_evt_1',
      title: 'Weekly Focus Sprint',
      description: '2 hours of absolute deep work. Turn off phones!',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '18:00'
    }
  ]
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      appMode: 'focus',
      habits: INITIAL_HABITS,
      stats: INITIAL_STATS,
      guild: INITIAL_GUILD,

      toggleAppMode: () => set((state) => ({ appMode: state.appMode === 'focus' ? 'rpg' : 'focus' })),
      
      setAppMode: (mode) => set({ appMode: mode }),

      addHabit: (title, resourceReward, routine) => set((state) => ({
        habits: [
          ...state.habits,
          {
            id: Math.random().toString(36).substring(2, 9),
            title,
            createdAt: new Date().toISOString(),
            completions: [],
            resourceReward,
            baseXp: 15,
            routine
          }
        ]
      })),

      toggleHabitCompletion: (id, date) => {
        // BUG FIX: Nudge logic moved OUTSIDE set() to prevent stale closure interference
        console.log(`[toggleHabitCompletion] ENTER — id: ${id}, date: ${date}`);

        set((state) => {
          const habit = state.habits.find(h => h.id === id);
          if (!habit) {
            console.warn(`[toggleHabitCompletion] Habit ${id} not found — aborting.`);
            return {};  // FIX: return {} instead of state to avoid Zustand swallowing the call
          }

          const existingCompletion = habit.completions.find(c => c.date === date);

          if (existingCompletion) {
            // Remove completion and deduct rewards (Anti-farming logic)
            const updatedHabits = state.habits.map(h => 
              h.id === id ? { ...h, completions: h.completions.filter(c => c.date !== date) } : h
            );
            
            const statsDelta = { ...state.stats };
            const xpReduction = habit.baseXp + Math.floor(statsDelta.level * 1.5);
            
            statsDelta.xp = Math.max(0, statsDelta.xp - xpReduction);
            statsDelta.gold = Math.max(0, statsDelta.gold - Math.floor(xpReduction / 2));
            statsDelta.resources = { 
              ...statsDelta.resources, 
              [habit.resourceReward]: Math.max(0, statsDelta.resources[habit.resourceReward] - 1) 
            };

            console.log(`[toggleHabitCompletion] REMOVING completion for ${date}. Deducting ${xpReduction} XP.`);
            return { habits: updatedHabits, stats: statsDelta };
          }

          // Add completion with explicit 'completed' status
          const newCompletion: Completion = { date, status: 'completed' };
          const updatedHabits = state.habits.map(h => 
            h.id === id
              ? { ...h, completions: [...h.completions, newCompletion].sort((a, b) => a.date.localeCompare(b.date)) }
              : h
          );

          // "Critical Hit Formula" simulation: higher level = slightly more XP
          const statsDelta = { ...state.stats };
          const xpGain = habit.baseXp + Math.floor(statsDelta.level * 1.5);
          statsDelta.xp += xpGain;
          statsDelta.gold += Math.floor(xpGain / 2);
          statsDelta.resources = { ...statsDelta.resources, [habit.resourceReward]: statsDelta.resources[habit.resourceReward] + 1 };

          if (statsDelta.xp >= statsDelta.maxXp) {
            statsDelta.xp = statsDelta.xp - statsDelta.maxXp;
            statsDelta.level += 1;
            statsDelta.maxXp = Math.floor(statsDelta.maxXp * 1.25);
            statsDelta.phoenixFreezes += 1;
          }

          console.log(`[toggleHabitCompletion] ADDED completion for ${date}. New count: ${updatedHabits.find(h => h.id === id)?.completions.length}, XP: ${statsDelta.xp}`);
          return { habits: updatedHabits, stats: statsDelta };
        });

        // Nudge logic: resolved AFTER set() completes, reading fresh state via get()
        get().checkAchievements();

        const freshState = get();
        const habit = freshState.habits.find(h => h.id === id);
        if (habit?.triggerHabitId) {
          const linkedHabit = freshState.habits.find(h => h.id === habit.triggerHabitId);
          if (linkedHabit && !linkedHabit.completions.find(c => c.date === date)) {
            return () => {
              console.log(`[Soft Nudge] Don't break the chain! Time for: ${linkedHabit.title}`);
            };
          }
        }
      },

      repairStreak: (habitId, missingDate) => {
        console.log(`[repairStreak] ENTER — habitId: ${habitId}, missingDate: ${missingDate}`);

        set((state) => {
          if (state.stats.phoenixFreezes <= 0) {
            console.warn(`[repairStreak] No Phoenix charges remaining (${state.stats.phoenixFreezes}).`);
            return {};  // FIX: return {} not state
          }

          const habit = state.habits.find(h => h.id === habitId);
          if (!habit) {
            console.warn(`[repairStreak] Habit ${habitId} not found.`);
            return {};  // FIX: return {} not state
          }

          const alreadyExists = habit.completions.find(c => c.date === missingDate);
          if (alreadyExists) {
            console.warn(`[repairStreak] Date ${missingDate} already has a completion entry.`);
            return {};  // FIX: return {} not state
          }

          const repairedCompletion: Completion = { date: missingDate, status: 'repaired' };
          const updatedHabits = state.habits.map(h =>
            h.id === habitId
              ? { ...h, completions: [...h.completions, repairedCompletion].sort((a, b) => a.date.localeCompare(b.date)) }
              : h
          );

          const newFreezes = state.stats.phoenixFreezes - 1;
          console.log(`[repairStreak] SUCCESS — Repaired ${missingDate}. Charges remaining: ${newFreezes}. Completions: ${updatedHabits.find(h => h.id === habitId)?.completions.length}`);

          return {
            habits: updatedHabits,
            stats: {
              ...state.stats,
              phoenixFreezes: newFreezes
            }
          };
        });
      },

      gainXp: (amount, reason) => {
        set((state) => {
          let statsDelta = { ...state.stats };
          statsDelta.xp += amount;
          if (statsDelta.xp >= statsDelta.maxXp) {
            statsDelta.xp -= statsDelta.maxXp;
            statsDelta.level += 1;
            statsDelta.maxXp = Math.floor(statsDelta.maxXp * 1.25);
          }
          statsDelta.gold += Math.floor(amount / 2);
          return { stats: statsDelta };
        });
        get().checkAchievements();
      },

      completePomodoro: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            pomodorosCompleted: (state.stats.pomodorosCompleted || 0) + 1
          }
        }));
        get().gainXp(50, 'pomodoro');
      },

      checkAchievements: () => set((state) => {
        const stats = state.stats;
        const newBadges = [...(stats.unlockedBadges || [])];
        
        if (stats.level >= 5 && !newBadges.includes('apprentice_gardener')) newBadges.push('apprentice_gardener');
        if (stats.level >= 10 && !newBadges.includes('botanical_weaver')) newBadges.push('botanical_weaver');
        if ((stats.pomodorosCompleted || 0) >= 3 && !newBadges.includes('zen_master')) newBadges.push('zen_master');
        if (stats.resources.intelligence >= 10 && !newBadges.includes('scholar')) newBadges.push('scholar');
        if (stats.resources.strength >= 10 && !newBadges.includes('iron_will')) newBadges.push('iron_will');

        return { stats: { ...stats, unlockedBadges: newBadges } };
      }),

      buyTheme: (theme, cost) => set((state) => {
        if (state.stats.gold >= cost) {
          return {
            stats: { ...state.stats, gold: state.stats.gold - cost, activeTheme: theme },
          };
        }
        return state;
      }),

      setTheme: (theme) => set((state) => ({
        stats: { ...state.stats, activeTheme: theme }
      })),

      updateGuildSettings: (settings) => set((state) => ({
        guild: { ...state.guild, ...settings }
      })),

      addGuildEvent: (event) => set((state) => ({
        guild: {
          ...state.guild,
          events: [
            ...(state.guild.events || []),
            { ...event, id: Math.random().toString(36).substring(2, 9) }
          ]
        }
      })),

      removeGuildEvent: (id) => set((state) => ({
        guild: {
          ...state.guild,
          events: (state.guild.events || []).filter(e => e.id !== id)
        }
      })),

        buyPhoenixCharge: () => set((state) => {
          const cost = 50;
          if (state.stats.gold >= cost) {
            return {
              stats: {
                ...state.stats,
                gold: state.stats.gold - cost,
                phoenixFreezes: state.stats.phoenixFreezes + 1
              }
            };
          }
          return state;
        }),

        claimVanguardReward: () => set((state) => {
          if (!state.stats.vanguardRewardClaimed) {
            return {
              stats: {
                ...state.stats,
                phoenixFreezes: state.stats.phoenixFreezes + 1,
                vanguardRewardClaimed: true
              }
            };
          }
          return state;
        })
      }),
    {
      name: 'sync-spark-storage',
    }
  )
);
