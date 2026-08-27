import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb } from './client.js';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://odyssey:odyssey@localhost:5432/odyssey_ops';

async function main() {
  const db = createDb(connectionString);
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations applied successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
