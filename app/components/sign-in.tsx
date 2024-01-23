import { Form } from "@remix-run/react";
import { GoogleIcon } from "~/icons";

export default function SignIn() {
  return (
    <div>
      <Form
        className="flex items-center justify-center gap-2"
        action={"/auth/google"}
        method="POST"
      >
        <button type="submit" className="w-full">
          <span className="inline-flex items-center gap-1.5">
            <GoogleIcon className="w-6 h-6" />
            <span>Sign In with Google</span>
          </span>
        </button>
      </Form>
    </div>
  );
}
