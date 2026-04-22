import { Model } from '@nozbe/watermelondb';
import { field, date, relation, children, readonly, action } from '@nozbe/watermelondb/decorators';
import { LogStatus, RetirementReason } from '../types/behavioral';

export class Habit extends Model {
  static table = 'habits';

  static associations = {
    habit_stacks: { type: 'belongs_to', key: 'stack_id' },
  } as const;

  @field('title') title!: string;
  @field('routine') routine!: string;
  @field('base_xp') baseXp!: number;
  @field('is_archived') isArchived!: boolean;
  @field('peak_start_minute') peakStartMinute?: number;
  @field('peak_end_minute') peakEndMinute?: number;
  @field('failure_count_14d') failureCount14d!: number;
  @field('retirement_reason') retirementReason?: RetirementReason | null;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('pillars', 'pillar_id') pillar!: any;
  @relation('habit_stacks', 'stack_id') stack!: any;
  @relation('habits', 'trigger_habit_id') triggerHabit!: any;
  @children('logs') logs!: any;

  @action async logCompletion(dateString: string, logStatus: LogStatus, xp: number) {
    let finalXp = xp;
    if (logStatus === LogStatus.COMPLETED) {
      const parentStack = await this.stack.fetch();
      if (parentStack) {
        // Growth Logic: apply stack momentum multiplier
        const stackMultiplier = parentStack.multiplierStreak >= 3 ? 2.0 : 1.5;
        finalXp = Math.floor(this.baseXp * stackMultiplier);
      }
    }

    return await this.collections.get('logs').create((log: any) => {
      log.habit.set(this);
      log.date = dateString;
      log.status = logStatus;
      log.xpGained = finalXp;
    });
  }
}
