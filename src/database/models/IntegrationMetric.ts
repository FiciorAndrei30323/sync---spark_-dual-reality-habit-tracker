import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class IntegrationMetric extends Model {
  static table = 'integration_metrics';

  @field('provider') provider!: string; // e.g., 'healthkit', 'oura'
  @field('metric_type') metricType!: string; // e.g., 'sleep_score'
  @field('value') value!: number;
  @field('timestamp') timestamp!: number;
  @field('sync_log_id') syncLogId?: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
