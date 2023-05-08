// app/routes/login.tsx
import { Form } from "@remix-run/react";
import type { DiscordUser } from "~/auth.server";
import { Link } from "react-router-dom";
import { useRouteData } from "~/utils/hooks";

export default function Login() {
  const user = useRouteData<{ user: DiscordUser | undefined }>("root")?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl mx-10">
          <span className="block">
            Wow, seems like you are new here! If you have just recorded a
            meeting, you can click "get started" below to visit the dashboard.
          </span>
        </h1>
        <Form action="/auth/discord" method="post">
          <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded mt-5 border-white border-2">
            ✨ get started ✨
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
