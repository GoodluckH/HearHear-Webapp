// app/routes/login.tsx
import { redirect, type LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export let loader: LoaderFunction = () => redirect("/");
export default function Login() {
  return (
    <Form action="/auth/discord" method="post">
      <button>Login with Discord</button>
    </Form>
  );
}
