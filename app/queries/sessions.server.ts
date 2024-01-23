import { getSessionExpirationDate } from "~/utils/misc";
import { sql } from "../db/db.server";

type NewSessionResult = {
  id: number;
  expirationDate: Date;
  userId: number;
};
export const createDbSession = async (
  userId: number
): Promise<NewSessionResult> => {
  const [session]: NewSessionResult[] = await sql`insert into sessions ${sql({
    expirationDate: getSessionExpirationDate(),
    userId,
  })} returning id, "expirationDate", "userId"`;
  if (!session) {
    throw new Error("Failed to insert session");
  }
  return session;
};

type SessionResult = { userId: number };
export const findActiveDbSession = async (
  id: number
): Promise<SessionResult | undefined> => {
  const [session]: SessionResult[] =
    await sql`select "userId" from sessions where id = ${id} and "expirationDate" > now()`;
  return session;
};
