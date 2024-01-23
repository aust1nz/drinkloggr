import { OIDCStrategy } from 'web-oidc/remix';
// import { redirectWithToast } from "~/utils/toast.server";
import { redirect } from '@remix-run/node';
import { type AuthProvider } from './authenticator';

export class GoogleProvider implements AuthProvider {
  getAuthStrategy() {
    return new OIDCStrategy(
      {
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
        authorizationParams: {
          scope: ['openid', 'email profile'],
        },
        issuer: 'https://accounts.google.com',
        response_type: 'code',
      },
      async ({ profile }) => {
        if (!profile.email || !profile.email_verified) {
          throw redirect('/login', {
            // title: "Cannot connect Google Account",
            // description: "Your Google Email is Unverified",
            // type: "error",
          });
        }
        return {
          email: profile.email,
          id: profile.sub,
          name: profile.name,
        };
      },
    );
  }

  async resolveConnectionData() {
    // You may consider making a fetch request to Google to get the user's
    // profile or something similar here.
    return {
      displayName: 'Google Account',
      link: 'http://myaccount.google.com/',
    } as const;
  }
}
