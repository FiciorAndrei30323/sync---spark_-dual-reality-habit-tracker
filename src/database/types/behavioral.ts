/**
 * Behavioral Type Definitions for Project Apex
 * These enums drive the psychological nudges, Resilience Scoring, and Ghost Productivity mechanics.
 */

/**
 * Represents the psychological state of a habit check-in on any given day.
 * Instead of a binary Pass/Fail, we use a nuanced state model.
 */
export enum LogStatus {
  /**
   * The user actively performed the habit.
   * Action: Increases Resilience Score.
   */
  COMPLETED = 'completed',

  /**
   * The user intentionally bypassed the habit for a valid reason (Rest Day, Sick Day, Life Chaos).
   * Action: Applies a micro-decay (entropy) rather than a streak-breaking penalty. Protects identity momentum.
   */
  NEUTRAL = 'neutral',

  /**
   * The user failed to perform the habit and provided no excuse.
   * Action: Applies the chronotype-weighted decay penalty.
   */
  SKIPPED = 'skipped',
}

/**
 * Represents the metacognitive justification for archiving a habit ("Ghost Productivity").
 * This defines why the user is pruning the habit and informs the coaching UI.
 */
export enum RetirementReason {
  /**
   * Mastery achieved. The habit is so automatic it no longer needs UI space.
   */
  GRADUATED = 'graduated',

  /**
   * The user's core identity focus has shifted (e.g., from Athlete to Scholar), requiring resource reallocation.
   */
  PILLAR_SHIFT = 'pillar_shift',

  /**
   * The habit triggered too many 'SKIPPED' logs. The AI algorithm recommended pruning rather than feeling guilty.
   */
  TOO_MUCH_FRICTION = 'too_much_friction',

  /**
   * Major external circumstances (e.g., injury, new baby, moving). A compassionate pause.
   */
  LIFE_EVENT = 'life_event',
}

/**
 * Interface definition for a Habit in the application context.
 */
export interface IHabitContext {
  id: string;
  pillarId: string;
  stackId?: string;
  triggerHabitId?: string;
  title: string;
  routine: string;
  peakStartMinute?: number;
  peakEndMinute?: number;
  baseXp: number;
  failureCount14d: number;
  retirementReason?: RetirementReason | null;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Interface definition for a Log in the application context.
 */
export interface ILogContext {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: LogStatus;
  xpGained: number;
  createdAt: number;
  updatedAt: number;
}
