import { createCookieSessionStorage } from "@remix-run/node";

export const onboardingEmailSessionKey = "onboardingEmail";
export const providerIdKey = "providerId";
export const prefilledProfileKey = "prefilledProfile";
export const resetPasswordEmailKey = "resetPasswordEmail";
export const newEmailKey = "newEmailAddress";
export const unverifiedSessionIdKey = "unverifiedSessionId";
export const verifiedTimeKey = "verified-time";

export const verifySessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_verification",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});
