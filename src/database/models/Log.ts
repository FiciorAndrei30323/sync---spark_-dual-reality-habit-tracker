import { Model } from '@nozbe/watermelondb';
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators';

export class Log extends Model {
  static table = 'logs';

  @field('date') date!: string; // YYYY-MM-DD
  @field('status') status!: string; // 'completed' | 'skipped' | 'failed' | 'neutral'
  @field('xp_gained') xpGained!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('habits', 'habit_id') habit!: any;
}
