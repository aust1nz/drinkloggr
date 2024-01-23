import { LoaderFunctionArgs, redirect } from "@remix-run/node";
// import { createProviderConnection } from "~/db/queries/connections.server";
import { createDbSession } from "~/queries/sessions.server";
import { createConnectedUser, findUserByEmail } from "~/queries/users.server";
import { authenticator } from "~/utils/auth/authenticator";
import { getUserId } from "~/utils/auth/get-user-id";
import {
  combineHeaders,
  destroyRedirectToHeader,
  getRedirectCookieValue,
} from "~/utils/misc";
// import { createToastHeaders, redirectWithToast } from "~/utils/toast.server";
import {
  createProviderConnection,
  findExistingConnection,
} from "~/queries/connections.server";
import { authSessionStorage } from "~/utils/sessions/auth.session.server";
import { handleNewSession } from "~/utils/sessions/handle-new-session";

const destroyRedirectTo = { "set-cookie": destroyRedirectToHeader };

async function makeSession(
  {
    request,
    userId,
    redirectTo,
  }: { request: Request; userId: number; redirectTo?: string | null },
  responseInit?: ResponseInit
) {
  redirectTo ??= "/";
  const session = await createDbSession(userId);
  return handleNewSession(
    { request, session, redirectTo },
    { headers: combineHeaders(responseInit?.headers, destroyRedirectTo) }
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const providerName = "google";
  const redirectTo = getRedirectCookieValue(request);

  const authResult = await authenticator
    .authenticate(providerName, request, { throwOnError: true })
    .then(
      (data) => ({ success: true, data }) as const,
      (error) => ({ success: false, error }) as const
    );

  if (!authResult.success) {
    console.error(authResult.error);
    throw await redirect(
      "/",
      // {
      //   title: "Auth Failed",
      //   description: `There was an error authenticating with Google.`,
      //   type: "error",
      // },
      { headers: destroyRedirectTo }
    );
  }

  const { data: profile } = authResult;
  const existingConnection = await findExistingConnection("google", profile.id);

  const userId = await getUserId(request);

  if (existingConnection && userId) {
    if (existingConnection.userId === userId) {
      return redirect(
        "/",
        // {
        //   title: "Already Connected",
        //   description: `Your "${profile.email}" Google account is already connected.`,
        // },
        { headers: destroyRedirectTo }
      );
    } else {
      return redirect(
        "/",
        // {
        //   title: "Already Connected",
        //   description: `The "${profile.email}" Google account is already connected to another account.`,
        // },
        { headers: destroyRedirectTo }
      );
    }
  }

  // If we're already logged in, then link the account
  if (userId) {
    await createProviderConnection({
      providerName,
      providerId: profile.id,
      userId,
    });
    return redirect(
      "/",
      // {
      //   title: "Connected",
      //   type: "success",
      //   description: `Your "${profile.email}" Google account has been connected.`,
      // },
      { headers: destroyRedirectTo }
    );
  }

  // Connection exists already? Make a new session
  if (existingConnection) {
    return makeSession({ request, userId: existingConnection.userId });
  }

  // if the email matches a user in the db, then link the account and
  // make a new session
  const user = await findUserByEmail(profile.email);
  if (user) {
    await createProviderConnection({
      providerName,
      providerId: profile.id,
      userId: user.id,
    });
    return makeSession(
      { request, userId: user.id },
      {
        // headers: await createToastHeaders({
        //   title: "Connected",
        //   description: `Your "${profile.email}" Google account has been connected.`,
        // }),
      }
    );
  }

  // this is a new user, so let's get them onboarded
  const session = await createConnectedUser({
    email: profile.email.toLowerCase(),
    providerId: profile.id,
    providerName,
  });

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  authSession.set("sessionId", session.id);
  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: session.expirationDate,
    })
  );

  return redirect("/");
}
