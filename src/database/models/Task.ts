import { Model } from '@nozbe/watermelondb';
import { field, date, relation, readonly } from '@nozbe/watermelondb/decorators';

export class Task extends Model {
  static table = 'tasks';

  @field('title') title!: string;
  @field('status') status!: string; // pending, completed, failed
  @date('due_date') dueDate?: Date;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('pillars', 'pillar_id') pillar!: any;
}
