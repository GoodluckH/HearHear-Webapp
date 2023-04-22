import { redirect } from "@remix-run/node";

export function loader() {
  return redirect("/dashboard");
}

export default function Index() {
  return (
    <div>
      <h1>Guild</h1>
      <p>
        You are not supposed to see this one. If you are seeing this, congrats!
        You've broke my code.
      </p>
    </div>
  );
}
