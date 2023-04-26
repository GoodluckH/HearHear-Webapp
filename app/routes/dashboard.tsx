import { type LoaderFunction } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
  type V2_MetaFunction,
} from "@remix-run/react";
import { auth } from "~/auth.server";
import { config } from "dotenv";
import type { DiscordUser } from "~/auth.server";
import { useRouteParam } from "~/utils/hooks";
import { useState } from "react";
import HowToUseBOT from "~/components/faq";
import SelectedMeetingProvider from "~/context/selectedMeetingContext";

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

export const meta: V2_MetaFunction = ({ data }: { data: DashboardProps }) => {
  return [{ title: `Dashboard - ${data.user.displayName} - HearHear` }];
};

export default function DashboardLayout() {
  const [selectedGuild, setSelectedGuild] = useState<string | undefined>(
    undefined
  );
  const { user, guilds } = useLoaderData<DashboardProps>();
  const navigation = useNavigation();

  const guildId = useRouteParam<string>("routes/dashboard", "guild");

  if (guildId !== undefined && selectedGuild === undefined) {
    setSelectedGuild(guildId);
  }

  const handleClick = (guildId: string) => {
    setSelectedGuild(guildId);
  };

  return (
    <div className="flex bg-gray-50 overflow-hidden min-h-screen">
      <nav className="w-64 bg-slate-100 border-r border-gray-200 h-screen flex flex-col">
        <div className="px-6 pt-8">
          <h1 className="text-xl font-bold mb-4">Dashboard</h1>
          <h2 className="text-sm text-gray-600 mb-4">
            Welcome {user.displayName}#{user.discriminator}
          </h2>
          <h2 className="text-md font-bold">Your Servers</h2>
        </div>
        <ul className="flex-grow text-sm text-gray-600 w-full">
          {guilds.map((guild: BasicGuildInfo) => (
            <NavLink
              prefetch="intent"
              to={`/dashboard/guilds/${guild.id}`}
              key={guild.id}
              onClick={() => handleClick(guild.id)}
            >
              <li
                key={guild.id}
                className={`flex items-center py-2 hover:bg-gray-200 ${
                  selectedGuild === guild.id ? "bg-gray-200" : ""
                }`}
              >
                {guild.icon === null ? (
                  <img
                    src="https://cdn.discordapp.com/embed/avatars/0.png"
                    alt={guild.name}
                    className=" ml-6 w-8 h-8 rounded-full mr-1"
                  />
                ) : (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt={guild.name}
                    className=" ml-6 w-8 h-8 rounded-full mr-1"
                  />
                )}

                <span className="text-gray-700">{guild.name}</span>
              </li>
            </NavLink>
          ))}
        </ul>

        <footer className="h-[3rem] flex items-center mb-10 ">
          <HowToUseBOT />
        </footer>

        <footer className="h-[4rem] bg-slate-800 flex justify-center items-center">
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt={user.displayName}
            className="w-10 h-10 rounded-full mx-1"
          />

          <div className="flex flex-col ml-1">
            <span className="text-gray-100 font-medium text-sm">
              {user.displayName}
            </span>
            <span className="text-gray-400 text-sm">#{user.discriminator}</span>
          </div>

          <Form action="/auth/discord/logout" method="post">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-full ml-8 mr-1">
              out
            </button>
          </Form>
        </footer>
      </nav>
      <SelectedMeetingProvider>
        <div className="flex-1 max-h-screen overflow-auto">
          {navigation.state === "loading" &&
          navigation.location.pathname.match(/^\/dashboard\/guilds\/\d+$/) !==
            null ? (
            <Skeleton />
          ) : (
            <Outlet />
          )}
        </div>
      </SelectedMeetingProvider>
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
    <div className="flex">
      <div className="flex-auto max-w-md border-r-2 border-gray-200 p-10 min-h-screen">
        <h1 className="text-3xl font-bold animate-pulse">Meetings</h1>
        <div className="mt-10">
          <ul>
            {[1, 2, 3].map((_, id) => {
              return (
                <li
                  key={id}
                  className="flex-col flex items-center justify-center mb-5"
                >
                  <div className="bg-slate-100 rounded-lg shadow-lg p-4 min-h-[7rem] min-w-full animate-pulse"></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex-auto max-h-screen">
        <div className="animate-pulse min-h-screen"></div>
      </div>
    </div>
  );
}
