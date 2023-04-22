import { useRouteData, useRouteParam } from "~/utils/data";
import type { DashboardProps } from "./dashboard";
import { type LoaderFunction } from "@remix-run/node";
import type { Meeting } from "~/utils/db";
import { getMeetings } from "~/utils/db";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { convertUNIXToString } from "~/utils/timestamp";

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

  const [selectedCardId, setSelectedCardId] = useState(0);
  const [selectedMeetingId, setSelectedMeetingId] = useState<
    string | undefined
  >(undefined);

  const meetingId = useRouteParam<string>("routes/dashboard", "meeting");
  if (meetingId !== undefined && selectedMeetingId === undefined) {
    setSelectedMeetingId(meetingId);
  }

  const guild = guilds.find((guild) => guild.id === guildId);

  if (!guild) {
    return <div>Discord Server Not found</div>;
  }

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
                      setSelectedCardId(selectedCardId === id ? -1 : id)
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
                        <div className="font-semibold mb-5">{date}</div>
                        {meetings_grouped_by_date[date].map(
                          (meeting: Meeting) => (
                            <div key={meeting.id} className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                              <NavLink
                                to={`/dashboard/guilds/${guildId}/meetings/${meeting.id}`}
                                className="flex items-center justify-between w-full"
                                onClick={() => setSelectedMeetingId(meeting.id)}
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
  );
}
