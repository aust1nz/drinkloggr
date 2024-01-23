import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { logout } from '~/utils/auth/sign-out';

export const action = async ({ request }: ActionFunctionArgs) => {
  await logout({ request });
  return redirect('/');
};

export default function Settings() {
  return (
    <div>
      <Form method="post">
        <button type="submit">Sign Out</button>
      </Form>
    </div>
  );
}
