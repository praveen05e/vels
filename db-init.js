import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:yB2xynlflU0AEHo1@db.zvuaqclecraplexasimq.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    console.log('Connecting to Supabase Database...');
    await client.connect();
    
    console.log('Running Schema Migration...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '001_schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('Schema Migration Complete!');

    console.log('Running Seed Data...');
    const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '002_seed.sql'), 'utf-8');
    await client.query(seedSql);
    console.log('Seed Data Complete!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigrations();
