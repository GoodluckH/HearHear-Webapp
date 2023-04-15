import type { ActionFunction } from "@remix-run/node";
import { redirect, type LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export let loader: LoaderFunction = () => redirect("/");
export let action: ActionFunction = ({ request }) => {
  return auth.logout(request, {
    redirectTo: "/",
  });
};
