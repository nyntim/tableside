import { createDb, type Database } from '@odyssey/db';

export function getDbFromConnectionString(connectionString: string): Database {
  return createDb(connectionString);
}
