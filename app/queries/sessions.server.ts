import { getSessionExpirationDate } from '~/utils/misc';
import { sql } from '../db/db.server';

type NewSessionResult = {
  id: number;
  expirationDate: Date;
  userId: number;
};
type SessionResult = { userId: number };

export async function createDbSession(userId: number) {
  const newSession = {
    expirationDate: getSessionExpirationDate(),
    userId,
  };
  const [session]: [NewSessionResult?] = await sql`
    INSERT INTO sessions ${sql(newSession)}
    RETURNING id, "expirationDate", "userId"`;
  if (!session) {
    throw new Error('Failed to insert session');
  }
  return session;
}

export async function findActiveDbSession(id: number) {
  const [session]: [SessionResult?] = await sql`
      SELECT "userId"
      FROM sessions
      WHERE id = ${id}
      AND "expirationDate" > now()`;
  if (!session) {
    return null;
  }
  return session;
}

export async function deleteDbSession(id: number) {
  await sql`
    DELETE FROM sessions
    WHERE id = ${id}`;
}
