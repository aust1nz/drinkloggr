import { Authenticator, Strategy } from "remix-auth";
import { connectionSessionStorage } from "../sessions/connection.session.server";
import { GoogleProvider } from "./google.server";

const googleProvider = new GoogleProvider();

type ProviderUser = {
  id: string;
  email: string;
  name?: string;
};

export interface AuthProvider {
  getAuthStrategy(): Strategy<ProviderUser, any>;
  resolveConnectionData(providerId: string): Promise<{
    displayName: string;
    link?: string | null;
  }>;
}

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage
);
authenticator.use(googleProvider.getAuthStrategy(), "google");
