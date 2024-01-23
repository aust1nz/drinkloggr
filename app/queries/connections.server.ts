import { sql } from "~/db/db.server";

type ExistingConnection = {
  userId: number;
};
export const findExistingConnection = async (
  providerName: string,
  providerId: string
): Promise<ExistingConnection | undefined> => {
  const [existingConnection]: ExistingConnection[] =
    await sql`select "userId" from connections where "providerName" = ${providerName} and "providerId" = ${providerId}`;
  return existingConnection;
};

type NewProviderInput = {
  providerName: string;
  providerId: string;
  userId: number;
};
export const createProviderConnection = async ({
  providerName,
  providerId,
  userId,
}: NewProviderInput) => {
  return await sql`insert into connections ${sql({
    providerName,
    providerId,
    userId,
  })}`;
};
