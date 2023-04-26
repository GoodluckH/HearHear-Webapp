// app/routes/login.tsx
import { Form } from "@remix-run/react";
import type { DiscordUser } from "~/auth.server";
import { Link } from "react-router-dom";
import { useRouteData } from "~/utils/hooks";
import { redirect } from "@remix-run/node";

export let loader = () => {
  return redirect("/");
};

export default function Login() {
  const user = useRouteData<{ user: DiscordUser | undefined }>("root")?.user;

  if (!user) {
    return (
      <div className="">
        <Form action="/auth/discord" method="post">
          <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded mt-5 border-white border-2">
            ✨ this button away ✨
          </button>
        </Form>
      </div>
    );
  } else {
    return (
      <div className="">
        <p className="mt-4 text-gray-300">
          👋 Welcome back, {user.displayName}!
        </p>
        <Link to="/dashboard">
          <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded mt-5 border-white border-2">
            go to my dashboard
          </button>
        </Link>
      </div>
    );
  }
}
