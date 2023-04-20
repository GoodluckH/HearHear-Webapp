// app/routes/login.tsx
import { Form } from "@remix-run/react";
import type { DiscordUser } from "~/auth.server";
import { Link } from "react-router-dom";
import { useRouteData } from "~/utils/data";

export default function Login() {
  const user = useRouteData<{ user: DiscordUser | undefined }>("root")?.user;

  if (!user) {
    return (
      <div className="">
        <Form action="/auth/discord" method="post">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login with Discord
          </button>
        </Form>
      </div>
    );
  } else {
    return (
      <div className="">
        <Link
          to="/dashboard"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </Link>
        <p className="mt-4 text-gray-600">
          Welcome back, {user.displayName}#{user.discriminator}!
        </p>
      </div>
    );
  }
}
