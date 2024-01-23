import * as dotenv from "dotenv";
import fs from "fs";
import path, { dirname } from "path";
import postgres from "postgres";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATION_DIRECTORY = "../app/db/migrations" as const;
const SEEDS_DIRECTORY = "../app/db/seeds" as const;
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || "", {
  idle_timeout: 1,
  onnotice: () => false,
});

// Drop the schema if the environment variable is set.
// Useful for iterating in dev mode.
if (
  process.env.NODE_ENV === "development" &&
  process.env.DROP_SCHEMA_ON_MIGRATIONS === "true"
) {
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public`;
}

// Ensure the migrations table exists.
await sql`
    select 'migrations'::regclass
  `.catch(
  () => sql`
    create table migrations (
      name text primary key,
      created_at timestamp with time zone not null default now()
    )
  `
);

// Find migrations that are already recorded in the database.
const completedMigrations = (
  await sql<{ name: string }[]>`
    select name from migrations`
).map(({ name }) => name);

// Find .sql files in the migrations directory that haven't been run yet.
// Migrations must match the format YYYY.MM.DD.name.sql
// If you're running multiple migrations on the same day and their
// run order is important, add a letter to ensure consistent order,
// e.g.:
//   - 2020.01.01.a.initial-migration.sql
//   - 2020.01.01.b.add-indexes.sql
const newMigrations = fs
  .readdirSync(path.join(__dirname, MIGRATION_DIRECTORY))
  .filter(
    (migrationName) =>
      migrationName.match(/^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\..*\.sql$/) &&
      !completedMigrations.includes(migrationName)
  );

for (const migration of newMigrations) {
  await sql.begin(async (sql) => {
    await sql.file(path.join(__dirname, MIGRATION_DIRECTORY, migration));
    await sql`insert into migrations (name) values (${migration})`;
  });
}

if (process.env.NODE_ENV === "development") {
  const seeds = fs
    .readdirSync(path.join(__dirname, SEEDS_DIRECTORY))
    .filter((seedName) => seedName.match(/\.sql$/));
  for (const seed of seeds) {
    await sql.file(path.join(__dirname, SEEDS_DIRECTORY, seed));
  }
}
