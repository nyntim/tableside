import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://odyssey:odyssey@localhost:5432/odyssey_ops';

async function main() {
  const sql = postgres(connectionString, { max: 1 });
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql.end();
  console.log('Database reset. Run db:migrate and db:seed next.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Reset failed:', error);
  process.exit(1);
});
