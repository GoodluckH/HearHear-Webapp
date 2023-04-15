import type { V2_MetaFunction } from "@remix-run/react";
import Login from "./login";

export const meta: V2_MetaFunction = () => {
  return [{ title: "HearHear" }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to HearHear</h1>
      <Login />
    </div>
  );
}
