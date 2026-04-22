import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';

export class UserSettings extends Model {
  static table = 'user_settings';

  @field('chronotype') chronotype!: string; // EarlyBird, NightOwl, Polyphasic
  @field('peak_start_minute') peakStartMinute!: number; // e.g., 480 (08:00)
  @field('peak_end_minute') peakEndMinute!: number; // e.g., 840 (14:00)

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('users', 'user_id') user!: any;
}
