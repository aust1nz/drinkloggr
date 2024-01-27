import { invariant } from '~/utils/misc';
import { sql } from '../db/db.server';

type User = {
  id: number;
  email: string;
  name: string;
};

type UserIdOnly = {
  id: number;
};

type NewUserSchema = {
  email: string;
  name?: string;
  googleSub: string;
};

export async function findUser(id: number) {
  const [user]: [User?] = await sql`
    SELECT id, email, name
    FROM users
    WHERE id = ${id}`;
  invariant(user, 'User unexpectedly not found');
  return user;
}

export async function findUserBySub(sub: string) {
  const [user]: [User?] = await sql`
    SELECT id, email, name
    FROM users
    WHERE "googleSub" = ${sub}`;
  return user;
}

export async function findUserByEmail(email: string) {
  const [user]: [UserIdOnly?] = await sql`
    SELECT id
    FROM users
    WHERE email = ${email.toLowerCase()}`;
  return user;
}

export async function createUser(userInput: NewUserSchema) {
  const [user]: [UserIdOnly?] = await sql`
    INSERT INTO users ${sql(userInput)}
    RETURNING id`;
  invariant(user, 'User unexpectedly not created');
  return user;
}
