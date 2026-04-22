import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, differenceInDays } from 'date-fns';

export type ResourceType = 'strength' | 'intelligence' | 'vitality' | 'focus';
export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
  id: string;
  title: string;
  createdAt: string; // ISO date
  completions: string[]; // Array of YYYY-MM-DD
  resourceReward: ResourceType;
  baseXp: number;
  routine: RoutineType;
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
  toggleHabitCompletion: (id: string, date: string) => void;
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
  activeTheme: 'natural'
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
        set((state) => {
          const habit = state.habits.find(h => h.id === id);
          if (!habit) return state;

          const isCompleted = habit.completions.includes(date);
          let newHabits = [...state.habits];
          let statsDelta = { ...state.stats };

          if (isCompleted) {
            // Remove completion
            newHabits = state.habits.map(h => 
              h.id === id ? { ...h, completions: h.completions.filter(c => c !== date) } : h
            );
            // We don't revert XP to prevent XP farming exploits by toggling, 
            // but in a strict system we might. Emphasizing positive reinforcement for now.
          } else {
            // Add completion
            newHabits = state.habits.map(h => 
              h.id === id ? { ...h, completions: [...h.completions, date].sort() } : h
            );
            
            // "Critical Hit Formula" simulation: higher level = slightly more XP
            const xpGain = habit.baseXp + Math.floor(statsDelta.level * 1.5);
            statsDelta.xp += xpGain;
            statsDelta.gold += Math.floor(xpGain / 2);
            statsDelta.resources[habit.resourceReward] += 1;

            if (statsDelta.xp >= statsDelta.maxXp) {
              statsDelta.xp = statsDelta.xp - statsDelta.maxXp;
              statsDelta.level += 1;
              statsDelta.maxXp = Math.floor(statsDelta.maxXp * 1.25); // Level scaling
              statsDelta.phoenixFreezes += 1; // Reward a freeze on level up
            }
          }

          return { habits: newHabits, stats: statsDelta };
        });
        get().checkAchievements();
      },

      repairStreak: (habitId, missingDate) => {
        set((state) => {
          if (state.stats.phoenixFreezes <= 0) return state;

          const newHabits = state.habits.map(h => 
            h.id === habitId && (!h.completions.includes(missingDate)) 
              ? { ...h, completions: [...h.completions, missingDate].sort() } 
              : h
          );

          return {
            habits: newHabits,
            stats: {
              ...state.stats,
              phoenixFreezes: state.stats.phoenixFreezes - 1
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
            stats: { ...state.stats, gold: state.stats.gold - cost },
            activeTheme: theme // Instantly equip
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
      })
    }),
    {
      name: 'sync-spark-storage',
    }
  )
);
