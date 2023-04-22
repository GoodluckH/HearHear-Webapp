import { type V2_MetaFunction } from "@remix-run/react";
import Login from "./login";
import NavBar from "~/components/nav";

export const meta: V2_MetaFunction = () => {
  return [{ title: "HearHear" }];
};

export default function Index() {
  return (
    <>
      <NavBar />
      <div className="bg-gray-100 h-[calc(100vh-74px)]">
        <div className="py-10">
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Welcome to HearHear
                </h1>
                <Login />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
