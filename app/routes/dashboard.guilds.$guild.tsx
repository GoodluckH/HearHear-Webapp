import {
  useMeetingArrayEffect,
  useRouteData,
  useRouteParam,
} from "~/utils/hooks";
import type { BasicGuildInfo, DashboardProps } from "./dashboard";
import { type LoaderFunction } from "@remix-run/node";
import type { Meeting } from "~/utils/db";
import { getMeetings } from "~/utils/db";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useContext } from "react";
import { convertUNIXToString } from "~/utils/timestamp";

import MagicCubeAnimation from "~/assets/lottie/magic-cube.gif";
import * as NoMeetingAnimation from "~/assets/lottie/no-meeting.json";
import { useLottie } from "lottie-react";
import { SelectedMeetingContext } from "~/context/selectedMeetingContext";
import type { SelectedMeetingContextType } from "~/@types/selectedMeeting";

export let loader: LoaderFunction = async ({ request }) => {
  const regexPattern = /\/guilds\/(\d+)/;
  const match = request.url.match(regexPattern);
  const guildId = match ? match[1] : null;

  return await getMeetings(guildId || "");
};

export default function GuildPage() {
  const meetings = useLoaderData<Meeting[]>();
  const guilds = useRouteData<DashboardProps>("routes/dashboard")?.guilds || [];
  const guildId = useRouteParam<string>("routes/dashboard", "guild");

  useMeetingArrayEffect(() => {}, meetings);

  const {
    selectedCardId,
    setSelectedCardId,
    selectedMeetingId,
    setSelectedMeetingId,
  } = useContext(SelectedMeetingContext) as SelectedMeetingContextType;

  const guild = guilds.find((guild) => guild.id === guildId);

  const meetings_grouped_by_date = meetings.reduce((acc, meeting) => {
    const date = convertUNIXToString(meeting.id, "%B %d, %Y");

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(meeting);

    return acc;
  }, {} as Record<string, Meeting[]>);

  const sorted_meetings = Object.keys(meetings_grouped_by_date).sort((a, b) => {
    return Date.parse(b) - Date.parse(a);
  });

  return (
    <>
      {guild && guild.hasHearHearBot ? (
        <>
          {sorted_meetings.length === 0 ? (
            <>
              <NoMeetingPage />
            </>
          ) : (
            <>
              <div className="flex">
                <div className="flex-auto max-w-md border-r-2 border-gray-200 p-10 min-h-screen">
                  <h1 className="text-3xl font-bold">Meetings</h1>
                  <div className="mt-10">
                    <ul>
                      {sorted_meetings.map((date, id) => {
                        const gradient =
                          selectedCardId === id
                            ? "bg-gradient-to-b from-green-400 to-blue-500"
                            : "";
                        return (
                          <li
                            key={date}
                            className="flex-col flex items-center justify-center mb-5"
                          >
                            <div
                              className={`bg-slate-100 rounded-lg shadow-lg p-4 cursor-pointer ${
                                selectedCardId === id
                                  ? `min-h-[7rem] text-white ${gradient}`
                                  : "border-solid border-gray-100 border-2"
                              } min-w-full`}
                              onClick={() =>
                                setSelectedCardId(
                                  selectedCardId === id ? -1 : id
                                )
                              }
                            >
                              {selectedCardId !== id && (
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold">{date}</div>
                                </div>
                              )}
                            </div>

                            {selectedCardId === id && (
                              // TIMETABLE SECTION
                              <div
                                className="mt-[-3rem] backdrop-blur-sm
                          bg-white/30 p-4 w-[90%] shadow-lg 
                          rounded-lg border-solid border-gray-50 border-1"
                              >
                                <div className="flex flex-col space-y-4">
                                  <div className="font-semibold mb-5">
                                    {date}
                                  </div>
                                  {meetings_grouped_by_date[date].map(
                                    (meeting: Meeting) => (
                                      <div
                                        key={meeting.id}
                                        className="flex items-center"
                                      >
                                        <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                                        <NavLink
                                          prefetch="intent"
                                          to={`/dashboard/guilds/${guildId}/meetings/${meeting.id}`}
                                          className="flex items-center justify-between w-full"
                                          onClick={() =>
                                            setSelectedMeetingId(meeting.id)
                                          }
                                        >
                                          <div
                                            className={`ml-4 bg-white shadow-md w-full
                                   p-3 rounded-lg hover:bg-gray-100 ${
                                     selectedMeetingId === meeting.id
                                       ? "border-solid border-green-500 border-2"
                                       : ""
                                   } `}
                                          >
                                            <div>{meeting.channelName}</div>
                                            <div className="text-gray-500">
                                              {convertUNIXToString(
                                                meeting.id,
                                                "%I:%M %p"
                                              )}{" "}
                                              -{" "}
                                              {convertUNIXToString(
                                                meeting.transcripts[
                                                  meeting.transcripts.length - 1
                                                ]!.filename.split("-")[0],
                                                "%I:%M %p"
                                              )}
                                            </div>
                                          </div>
                                        </NavLink>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="flex-auto max-h-screen w-1/3 overflow-auto">
                  <Outlet />
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {guild ? (
            <MagicBotInvite guild={guild} />
          ) : (
            <div className="flex flex-col items-center h-full">
              <h1 className="text-3xl font-bold mb-0 mt-10">
                something went wrong when getting server info.
              </h1>
            </div>
          )}
        </>
      )}
    </>
  );
}

function NoMeetingPage() {
  const options = {
    animationData: NoMeetingAnimation,
    loop: true,
  };

  const { View } = useLottie(options);

  return (
    <>
      <div className="flex flex-col items-center h-full">
        <div className="w-96 h-96">{View}</div>
        <h1 className="text-3xl font-bold mb-0 mt-10">nothing yet...</h1>
        <p className="text-gray-500 text-sm mt-5">
          try schedule some meetings with the HearHear bot... or take a nap
        </p>
      </div>
    </>
  );
}

function MagicBotInvite({ guild }: { guild: BasicGuildInfo }) {
  return (
    <>
      <div className="flex flex-col items-center h-full">
        <img
          src={MagicCubeAnimation}
          alt="Magic Cube"
          className="w-96 h-96 mt-10"
        />
        <h1 className="text-3xl font-bold mb-0 mt-[-2.5rem]">
          let the magic happen
        </h1>
        <button
          className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mt-5"
          onClick={() => {
            window.open(
              `https://discord.com/api/oauth2/authorize?client_id=1094729151514161204&permissions=380139210752&scope=applications.commands%20bot&guild_id=${guild.id}`,
              "popup",
              "width=600,height=600"
            );
          }}
        >
          ✨ Invite HearHear Bot ✨
        </button>
        <p className="text-gray-500 text-sm mt-5">
          refresh this page after you've added the bot
        </p>
      </div>
    </>
  );
}
