import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type Database = PostgresJsDatabase<typeof schema>;

export function createDb(connectionString: string): Database {
  const client = postgres(connectionString, {
    max: 5,
    fetch_types: false,
    prepare: true,
  });
  return drizzle(client, { schema });
}

export { schema };
