import { useEffect, useState } from 'react';
import { database } from './index';
import { Habit } from './models/Habit';
import { Log } from './models/Log';
import { Q } from '@nozbe/watermelondb';

/**
 * A generic hook to subscribe to any WatermelonDB Observable Query.
 */
function useObservable<T>(observable: any, initialState: T): T {
  const [data, setData] = useState<T>(initialState);

  useEffect(() => {
    const subscription = observable.subscribe((newData: T) => {
      setData(newData);
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  return data;
}

/**
 * Hook to retrieve all habits.
 * Can be extended to filter by pillar or stack constraint.
 */
export function useHabits(): Habit[] {
  const habitsQuery = database.collections.get<Habit>('habits').query();
  // We use useObservable to tie Watermelon's RxJS stream into React state
  return useObservable<Habit[]>(habitsQuery.observe(), []);
}

/**
 * Hook to retrieve logs.
 * Example of a constrained query for today's logs.
 */
export function useLogsByDate(dateString: string): Log[] {
  const logsQuery = database.collections.get<Log>('logs').query(
    Q.where('date', dateString)
  );
  return useObservable<Log[]>(logsQuery.observe(), []);
}

/**
 * Hook to retrieve a specific habit along with its child logs.
 * Helpful for rendering a detailed 'Habit View'.
 */
export function useHabitWithLogs(habitId: string) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    let unmounted = false;
    let logsSub: any = null;

    const fetchHabit = async () => {
      try {
        const h = await database.collections.get<Habit>('habits').find(habitId);
        if (!unmounted) {
          setHabit(h);
          // Now subscribe to its logs
          logsSub = h.logs.observe().subscribe((l: Log[]) => {
            if (!unmounted) setLogs(l);
          });
        }
      } catch (e) {
        console.warn('Habit not found', e);
      }
    };

    fetchHabit();

    return () => {
      unmounted = true;
      if (logsSub) logsSub.unsubscribe();
    };
  }, [habitId]);

  return { habit, logs };
}
