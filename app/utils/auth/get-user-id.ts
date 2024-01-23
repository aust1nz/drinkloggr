import { redirect } from "@remix-run/node";
import { findActiveDbSession } from "~/queries/sessions.server";
import { authSessionStorage } from "../sessions/auth.session.server";

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = authSession.get("sessionId");
  if (!sessionId) return null;
  const session = await findActiveDbSession(sessionId);
  if (!session?.userId) {
    throw redirect("/login", {
      headers: {
        "set-cookie": await authSessionStorage.destroySession(authSession),
      },
    });
  }
  return session.userId;
}
