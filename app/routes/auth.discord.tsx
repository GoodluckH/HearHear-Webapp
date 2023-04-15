// app/routes/auth/discord.tsx
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { auth } from "~/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return redirect("/dashboard");
};

export let action: ActionFunction = ({ request }) => {
  console.log("auth.discord.tsx");

  return auth.authenticate("discord", request);
};
