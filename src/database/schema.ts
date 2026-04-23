import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'level', type: 'number' },
        { name: 'xp', type: 'number' },
        { name: 'gold', type: 'number' },
        { name: 'phoenix_freezes', type: 'number' },
        { name: 'active_theme', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'user_settings',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'chronotype', type: 'string' }, // EarlyBird, NightOwl, Polyphasic
        { name: 'peak_start_minute', type: 'number' }, // e.g. 480 (08:00)
        { name: 'peak_end_minute', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'pillars',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'resource_type', type: 'string' }, // strength, intelligence, focus, vitality
        { name: 'color', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'habit_stacks',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'peak_start_minute', type: 'number', isOptional: true },
        { name: 'peak_end_minute', type: 'number', isOptional: true },
        { name: 'multiplier_streak', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'pillar_id', type: 'string', isIndexed: true },
        { name: 'stack_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'trigger_habit_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'routine', type: 'string' },
        { name: 'peak_start_minute', type: 'number', isOptional: true },
        { name: 'peak_end_minute', type: 'number', isOptional: true },
        { name: 'base_xp', type: 'number' },
        { name: 'failure_count_14d', type: 'number' },
        { name: 'retirement_reason', type: 'string', isOptional: true },
        { name: 'is_archived', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'pillar_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string' }, 
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'logs',
      columns: [
        { name: 'habit_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'string' }, // YYYY-MM-DD
        { name: 'status', type: 'string' }, // completed, skipped, failed, neutral, repaired
        { name: 'xp_gained', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'guild_events',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'event_date', type: 'number' },
        { name: 'duration_minutes', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'integration_metrics',
      columns: [
        { name: 'provider', type: 'string' }, // 'healthkit', 'oura'
        { name: 'metric_type', type: 'string' }, 
        { name: 'value', type: 'number' },
        { name: 'timestamp', type: 'number' },
        { name: 'sync_log_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    })
  ]
});
