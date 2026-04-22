import { database } from '../database';
import { Log } from '../database/models/Log';
import { Q } from '@nozbe/watermelondb';

export class ExportService {
  /**
   * Pulls all Logs and Resilience_Metrics data into a sanitized JSON format.
   * Uses WatermelonDB query APIs optimized for performance without blocking UI.
   */
  static async exportDataToJSON() {
    try {
      const logsCollection = database.collections.get<Log>('logs');
      
      // Fetch all logs asynchronously
      const allLogs = await logsCollection.query().fetch();
      
      // Filter for resilience metrics based on neutral/skipped statuses
      const resilienceLogs = allLogs.filter(
        log => log.status === 'neutral' || log.status === 'skipped'
      );
      
      const exportData = {
        timestamp: new Date().toISOString(),
        logs: allLogs.map(log => ({
          id: log.id,
          // Extract the relationship ID via raw data since we just need the string reference
          habit_id: (log as any)._raw.habit_id,
          date: log.date,
          status: log.status,
          xp_gained: log.xpGained,
          created_at: log.createdAt,
        })),
        resilience_metrics: {
          total_neutral_days: resilienceLogs.filter(l => l.status === 'neutral').length,
          total_skipped_days: resilienceLogs.filter(l => l.status === 'skipped').length,
          details: resilienceLogs.map(log => ({
            date: log.date,
            status: log.status
          }))
        }
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data: ', error);
      throw new Error('Failed to export metrics data.');
    }
  }

  /**
   * Trigger manual sync for the remote database
   * (Mock implementation using the sync concept requested)
   */
  static async sync() {
    // In a full sync environment, we would use:
    // await synchronize({ database, pullChanges, pushChanges });
    console.log('[Sync Engine] Sync triggered for local data storage.');
  }
}
