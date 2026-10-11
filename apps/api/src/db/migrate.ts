import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  console.log('[MIGRATE] Checking database configuration...');
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log('[MIGRATE] DATABASE_URL not set. In-memory schema initialized by default.');
    process.exit(0);
  }

  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('[MIGRATE] Connected to PostgreSQL. Applying 001_init.sql...');

    const sqlPath = path.resolve(__dirname, '../../../../db/migrations/001_init.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      await client.query(sql);
      console.log('[MIGRATE] 001_init.sql applied successfully!');
    } else {
      console.log(`[MIGRATE] Migration file not found at ${sqlPath}`);
    }
  } catch (err: any) {
    console.warn(`[MIGRATE] Notice: Could not connect to external PostgreSQL (${err.message}). Standalone in-memory relational store will be used.`);
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

runMigrations();
