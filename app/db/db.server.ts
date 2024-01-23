import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL);
export const PostgresError = postgres.PostgresError;
