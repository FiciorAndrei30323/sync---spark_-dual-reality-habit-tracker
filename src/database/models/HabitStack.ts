import { Model } from '@nozbe/watermelondb';
import { field, date, children, readonly, action } from '@nozbe/watermelondb/decorators';

export class HabitStack extends Model {
  static table = 'habit_stacks';

  static associations = {
    habits: { type: 'has_many', foreignKey: 'stack_id' } as const,
  };

  @field('name') name!: string;
  @field('peak_start_minute') peakStartMinute?: number;
  @field('peak_end_minute') peakEndMinute?: number;
  @field('multiplier_streak') multiplierStreak!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('habits') habits!: any;

  @action async incrementMomentum() {
    await this.update(stack => {
      stack.multiplierStreak += 1;
    });
  }

  @action async resetMomentum() {
    await this.update(stack => {
      stack.multiplierStreak = 0;
    });
  }
}
