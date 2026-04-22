import { Model } from '@nozbe/watermelondb';
import { field, date, relation, children, readonly } from '@nozbe/watermelondb/decorators';

export class Habit extends Model {
  static table = 'habits';

  @field('title') title!: string;
  @field('routine') routine!: string;
  @field('base_xp') baseXp!: number;
  @field('is_archived') isArchived!: boolean;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('pillars', 'pillar_id') pillar!: any;
  @children('logs') logs!: any;
}
