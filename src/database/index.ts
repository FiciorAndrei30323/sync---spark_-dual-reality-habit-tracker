import { Database } from '@nozbe/watermelondb';
// In a real React Native environment, we would use SQLiteAdapter
// Because we are mocking offline-only functionality, we will instantiate it here.
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';

import { User } from './models/User';
import { Pillar } from './models/Pillar';
import { Habit } from './models/Habit';
import { Task } from './models/Task';
import { Log } from './models/Log';
import { GuildEvent } from './models/GuildEvent';
import { IntegrationMetric } from './models/IntegrationMetric';

// Create Adapter (using loki for the current web-compatible environment setup in this repo,
// easily swappable to SQLiteAdapter in React Native)
const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Pillar,
    Habit,
    Task,
    Log,
    GuildEvent,
    IntegrationMetric,
  ],
});
