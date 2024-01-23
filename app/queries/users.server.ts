import { invariant } from "~/utils/misc";
import { sql } from "../db/db.server";
import { createProviderConnection } from "./connections.server";
import { createDbSession } from "./sessions.server";

type User = {
  id: number;
  email: string;
  name: string;
};
export const findUser = async (id: number) => {
  const [user]: User[] =
    await sql`select id, email, name from users where id = ${id}`;
  invariant(user, "User unexpectedly not found");
  return user;
};

type FoundUser = {
  id: number;
};
export const findUserByEmail = async (
  email: string
): Promise<FoundUser | undefined> => {
  const [user]: FoundUser[] =
    await sql`select id from users where email = ${email.toLowerCase()}`;
  return user;
};

type NewUserSchema = {
  email: string;
};
type CreatedUser = {
  id: number;
};
export const createUser = async (userInput: NewUserSchema) => {
  const [user]: CreatedUser[] = await sql`insert into users ${sql(
    userInput
  )} returning id`;
  return user;
};

export type ConnectedUserInput = {
  email: string;
  providerId: string;
  providerName: string;
};
export const createConnectedUser = async ({
  email,
  providerId,
  providerName,
}: ConnectedUserInput) => {
  return await sql.begin(async () => {
    const user = await createUser({
      email: email.toLowerCase(),
    });
    await createProviderConnection({
      userId: user.id,
      providerId,
      providerName,
    });
    const session = await createDbSession(user.id);
    return session;
  });
};
