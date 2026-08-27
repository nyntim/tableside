import { createDb, type Database } from '@tableside/db';

export function getDbFromConnectionString(connectionString: string): Database {
  return createDb(connectionString);
}
