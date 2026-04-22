import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class GuildEvent extends Model {
  static table = 'guild_events';

  @field('title') title!: string;
  @field('description') description?: string;
  @date('event_date') eventDate!: Date;
  @field('duration_minutes') durationMinutes!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
