import { sql } from '../db/db.server';

type DrinkLog = {
  id: number;
  date: string;
  drinks: number;
};

export async function findDrinkLogByUserAndDate(userId: number, date: Date) {
  const [log]: [DrinkLog?] = await sql`
    SELECT id, date, drinks
    FROM "drinkLogs"
    WHERE "userId" = ${userId}
      AND date = ${date}`;
  return log;
}

export async function findDrinkLogsByUserAndDateRange(userId: number) {
  return await sql<DrinkLog[]>`
    SELECT id, date, drinks
    FROM "drinkLogs"
    WHERE "userId" = ${userId}
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR from date) = EXTRACT(YEAR from NOW())`;
}

export async function setDrinks(userId: number, date: Date, drinks: number) {
  const drinkLog = {
    userId,
    date,
    drinks,
    updatedAt: new Date(),
  };
  await sql`
    INSERT INTO "drinkLogs" ${sql(drinkLog)}
    ON CONFLICT ("userId", date)
    DO UPDATE SET drinks = ${drinks}, "updatedAt" = NOW()`;
}

export async function logDrink(userId: number, date: Date) {
  const drinkLog = {
    userId,
    date,
    drinks: 1,
    updatedAt: new Date(),
  };
  await sql`
    INSERT INTO "drinkLogs" ${sql(drinkLog)}
    ON CONFLICT ("userId", date)
    DO UPDATE SET drinks = "drinkLogs".drinks + 1, "updatedAt" = NOW()`;
}

export async function removeDrink(userId: number, date: Date) {
  await sql`
    UPDATE "drinkLogs"
    SET drinks = GREATEST(drinks - 1, 0), "updatedAt" = NOW()
    WHERE "userId" = ${userId}
    AND date = ${date};`;
}
