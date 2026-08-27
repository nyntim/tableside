import { businessSettings } from '@tableside/db';
import type { Database } from '@tableside/db';
import { eq } from 'drizzle-orm';
import { notFound } from '../lib/errors.js';

export async function getSettings(db: Database) {
  const [settings] = await db.select().from(businessSettings).limit(1);
  if (!settings) {
    throw notFound('Settings');
  }
  return settings;
}

export async function updateSettings(
  db: Database,
  input: Partial<typeof businessSettings.$inferInsert>,
) {
  const current = await getSettings(db);
  const [updated] = await db
    .update(businessSettings)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(businessSettings.id, current.id))
    .returning();
  return updated!;
}
