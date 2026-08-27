import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { schema } from '@odyssey/db';
import type { Database } from '@odyssey/db';

export async function createTestDb(): Promise<{ db: Database; client: PGlite }> {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Database;
  await migrate(db as never, { migrationsFolder: '../../packages/db/drizzle' });
  return { db, client };
}
