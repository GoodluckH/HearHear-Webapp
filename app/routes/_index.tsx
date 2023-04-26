import { type V2_MetaFunction } from "@remix-run/react";
import NavBar from "~/components/nav";
import LandingPage from "~/components/landing";

export const meta: V2_MetaFunction = () => {
  return [{ title: "HearHear | 10x your daily meetings" }];
};

export default function Index() {
  return (
    <>
      <NavBar />
      <div className="">
        <div className="">
          <main>
            <LandingPage />
          </main>
        </div>
      </div>
    </>
  );
}
