import { invariant } from '~/utils/misc';
import { sql } from '../db/db.server';

type User = {
  id: number;
  email: string;
  name: string;
};
export const findUser = async (id: number) => {
  const [user]: User[] =
    await sql`select id, email, name from users where id = ${id}`;
  invariant(user, 'User unexpectedly not found');
  return user;
};

export const findUserBySub = async (sub: string): Promise<User | undefined> => {
  const [user]: User[] =
    await sql`select id, email, name from users where "googleSub" = ${sub}`;
  return user;
};

type FoundUser = {
  id: number;
};
export const findUserByEmail = async (
  email: string,
): Promise<FoundUser | undefined> => {
  const [user]: FoundUser[] =
    await sql`select id from users where email = ${email.toLowerCase()}`;
  return user;
};

type NewUserSchema = {
  email: string;
  name?: string;
  googleSub: string;
};
type CreatedUser = {
  id: number;
};
export const createUser = async (userInput: NewUserSchema) => {
  const [user]: CreatedUser[] = await sql`insert into users ${sql(
    userInput,
  )} returning id`;
  return user;
};
