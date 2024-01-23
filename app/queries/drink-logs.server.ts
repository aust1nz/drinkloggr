import { sql } from '../db/db.server';

type Log = {
  id: number;
  date: string;
  drinks: number;
};
export const findDrinkLogByUserAndDate = async (
  userId: number,
  date: Date,
): Promise<Log | null> => {
  const [logs] = await sql<
    Log[]
  >`select id, date, drinks from "drinkLogs" where "userId" = ${userId} and date = ${date}`;
  return logs;
};

export const findDrinkLogsByUserAndDateRange = async (
  userId: number,
): Promise<Log[]> => {
  const logs = await sql<
    Log[]
  >`select id, date, drinks from "drinkLogs" where "userId" = ${userId} and EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM now()) and EXTRACT(YEAR from date) = EXTRACT(YEAR from now())`;
  return logs;
};

export const setDrinks = async (
  userId: number,
  date: Date,
  drinks: number,
): Promise<void> => {
  await sql`insert into "drinkLogs" ("userId", date, drinks, "updatedAt") values (${userId}, ${date}, ${drinks}, now()) on conflict ("userId", date) do update set drinks = ${drinks}, "updatedAt" = now()`;
};

export const logDrink = async (userId: number, date: Date): Promise<void> => {
  await sql`insert into "drinkLogs" ("userId", date, drinks, "updatedAt") values (${userId}, ${date}, 1, now()) on conflict ("userId", date) do update set drinks = "drinkLogs".drinks + 1, "updatedAt" = now()`;
};

export const removeDrink = async (
  userId: number,
  date: Date,
): Promise<void> => {
  await sql`update "drinkLogs" set drinks = GREATEST(drinks - 1, 0), "updatedAt" = now() where "userId" = ${userId} and date = ${date}`;
};
