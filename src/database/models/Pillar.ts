import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export class Pillar extends Model {
  static table = 'pillars';

  @field('name') name!: string;
  @field('resource_type') resourceType!: string;
  @field('color') color!: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('habits') habits!: any;
  @children('tasks') tasks!: any;
}
