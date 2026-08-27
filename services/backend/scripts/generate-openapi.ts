import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { createDb } from '@tableside/db';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../openapi/openapi.json');

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://tableside:tableside@localhost:5432/tableside';

const app = createApp({
  getDb: () => createDb(connectionString),
});

const document = app.getOpenAPIDocument({
  openapi: '3.0.0',
  info: {
    title: 'Tableside API',
    version: '1.0.0',
    description: 'Restaurant operations API for Tableside',
  },
  servers: [{ url: 'http://127.0.0.1:8799', description: 'Local development' }],
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(document, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);
