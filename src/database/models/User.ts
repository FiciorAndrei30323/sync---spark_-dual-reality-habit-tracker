import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export class User extends Model {
  static table = 'users';

  @field('level') level!: number;
  @field('xp') xp!: number;
  @field('gold') gold!: number;
  @field('phoenix_freezes') phoenixFreezes!: number;
  @field('active_theme') activeTheme!: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
