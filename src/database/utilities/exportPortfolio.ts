import { database } from '../index';
import { Q } from '@nozbe/watermelondb';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { Log } from '../models/Log';
import { UserSettings } from '../models/UserSettings';

/**
 * Generate an Exportable Growth Portfolio.
 * Combines logs, habits, and resilience metrics into a localized JSON payload.
 * Optimized via WatermelonDB's asynchronous batch fetch processes.
 */
export async function exportGrowthPortfolio(): Promise<string> {
  // Fetch required data directly using native queries
  const [users, habits, logs, settings] = await Promise.all([
    database.get<User>('users').query().fetch(),
    database.get<Habit>('habits').query().fetch(),
    database.get<Log>('logs').query().fetch(),
    database.get<UserSettings>('user_settings').query().fetch(),
  ]);

  const portfolio = {
    exportDate: new Date().toISOString(),
    metrics: {
      totalHabits: habits.length,
      totalLogs: logs.length,
    },
    userContext: users.map(u => ({
      level: u.level,
      xp: u.xp,
      gold: u.gold,
      phoenixFreezes: u.phoenixFreezes,
    })),
    userSettings: settings.map(s => ({
      chronotype: s.chronotype,
      peakStartMinute: s.peakStartMinute,
      peakEndMinute: s.peakEndMinute,
    })),
    habits: habits.map(h => ({
      id: h.id,
      title: h.title,
      routine: h.routine,
      baseXp: h.baseXp,
      isArchived: h.isArchived,
      createdAt: h.createdAt,
    })),
    logs: logs.map(l => ({
      date: l.date,
      status: l.status,
      xpGained: l.xpGained,
      habitId: l.habit.id,
    })),
  };

  return JSON.stringify(portfolio, null, 2);
}
