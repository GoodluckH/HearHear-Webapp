import { type LoaderFunction } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { auth } from "~/auth.server";
import { config } from "dotenv";
import type { DiscordUser } from "~/auth.server";

export interface BasicGuildInfo {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  hasHearHearBot: boolean;
}

export interface DashboardProps {
  user: DiscordUser;
  guilds: Array<BasicGuildInfo>;
}

export let loader: LoaderFunction = async ({ request }) => {
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  config();

  const hearHearBotId = process.env.DISCORD_CLIENT_ID || "";
  const hearHearBotToken = process.env.DISCORD_BOT_TOKEN || "";

  const guilds = await Promise.all(
    getUserGuilds(user).map(async (guild: any) => ({
      ...guild,
      hasHearHearBot: await botIsInGuild(
        guild,
        hearHearBotId,
        hearHearBotToken
      ),
    }))
  );

  return { user, guilds };
};

export default function DashboardLayout() {
  const { user, guilds } = useLoaderData<DashboardProps>();
  const navigation = useNavigation();

  return (
    <div className="flex bg-gray-100 h-[calc(100vh-74px)] overflow-hidden">
      <nav className="w-64 bg-white border-r border-gray-200">
        <div className="px-6 py-8">
          <h1 className="text-xl font-bold mb-4">Dashboard</h1>
          <h2 className="text-sm text-gray-600 mb-4">
            Welcome {user.displayName}#{user.discriminator}
          </h2>
          <p className="mb-4">Your Servers</p>
          <ul className="flex-grow space-y-2 text-sm text-gray-600">
            {guilds.map((guild: BasicGuildInfo) => (
              <li
                key={guild.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-gray-700">{guild.name}</span>
                {guild.hasHearHearBot === true ? (
                  <NavLink
                    to={`/dashboard/meetings/${guild.id}`}
                    className="px-4 py-2 rounded-full text-white bg-green-500"
                  >
                    Show Meetings
                  </NavLink>
                ) : (
                  <button
                    onClick={() => {
                      window.open(
                        `https://discord.com/api/oauth2/authorize?client_id=1094729151514161204&permissions=380139210752&scope=applications.commands%20bot&guild_id=${guild.id}`,
                        "popup",
                        "width=600,height=600"
                      );
                    }}
                    className={`px-4 py-2 rounded-full text-white bg-blue-500`}
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>

          <Form action="/auth/discord/logout" method="post">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full">
              Logout
            </button>
          </Form>
        </div>
      </nav>
      <div className="flex-1 p-10 max-h-screen overflow-auto">
        {navigation.state !== "idle" ? <Skeleton /> : <Outlet />}
      </div>
    </div>
  );
}

function getUserGuilds(user: any) {
  return user.guilds ? user.guilds.map((guild: any) => guild) : [];
}

async function botIsInGuild(
  guild: any,
  hearHearBotId: string,
  hearHearBotToken: string
) {
  const hearHearBot = await fetch(
    `https://discord.com/api/guilds/${guild.id}/members/${hearHearBotId}`,
    {
      headers: {
        Authorization: `Bot ${hearHearBotToken}`,
      },
    }
  );

  return hearHearBot.status === 200;
}

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg flex items-center justify-between mb-10">
        <div className="w-64 h-12 rounded-md bg-gray-200 animate-pulse mr-6"></div>
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <ul>
        {[...Array(5)].map((_, index) => (
          <li
            key={index}
            className="border-t border-gray-200 py-4 flex items-center"
          >
            <div className="w-12 h-12 rounded-md bg-gray-200 animate-pulse mr-4"></div>
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 rounded-md bg-gray-200 animate-pulse"></div>
              <div className="w-1/2 h-3 rounded-md bg-gray-200 animate-pulse"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
