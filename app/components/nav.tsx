import { Form } from "@remix-run/react";
import { useState } from "react";
import type { DiscordUser } from "~/auth.server";
import { useRouteData } from "~/utils/data";
import logo from "~/assets/logo.svg";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useRouteData<{ user: DiscordUser | undefined }>("root")?.user;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-10 w-auto" src={logo} alt="Workflow" />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">
                HearHear
              </h1>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* on clicking the image, show logout button */}

            {user && (
              <>
                <button
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {user.avatar === null ? (
                    <img
                      src="https://cdn.discordapp.com/embed/avatars/0.png"
                      alt="user icon"
                      className="w-10 h-10 rounded-full object-cover mb-0 hover:opacity-80"
                    />
                  ) : (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                      alt="user avatar"
                      className="w-10 h-10 rounded-full object-cover mb-0 hover:opacity-80"
                    />
                  )}
                </button>

                <Form action="/auth/discord/logout" method="post">
                  <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full">
                    Logout
                  </button>
                </Form>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed. */}
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open. */}
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-4 space-y-1">
          {user && (
            <button
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Open Todos
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
