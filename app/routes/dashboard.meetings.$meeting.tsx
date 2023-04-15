import { useRouteData, useRouteParam } from "~/utils/data";
import type { DashboardProps } from "./dashboard";
import type { LoaderFunction } from "@remix-run/node";
import type { Meeting } from "~/utils/db";
import { getMeetings } from "~/utils/db";
import { useLoaderData } from "@remix-run/react";
import type { FC } from "react";
import { useState } from "react";
import { convertUNIXToString } from "~/utils/timestamp";

export let loader: LoaderFunction = async ({ request }) => {
  const guildId = request.url.split("/").pop();

  return await getMeetings(guildId || "");
};

export default function MeetingPage() {
  const meetings = useLoaderData<Meeting[]>();
  const guilds = useRouteData<DashboardProps>("routes/dashboard")?.guilds || [];
  const guildId = useRouteParam<string>(
    "routes/dashboard.meetings.$meeting",
    "meeting"
  );

  const guild = guilds.find((guild) => guild.id === guildId);

  if (!guild) {
    return <div>Discord Server Not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold mb-0">Meetings for {guild.name}</h1>
        <img
          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`}
          alt="discord server icon"
          className="w-12 h-12 rounded-full object-cover mb-0"
        />
      </div>
      <ul>
        {meetings
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((meeting) => (
            <Collapsible key={meeting.id} meeting={meeting} />
          ))}
      </ul>
    </div>
  );
}

interface MeetingProp {
  meeting: Meeting;
}

const Collapsible: FC<MeetingProp> = ({ meeting }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div>
      <button
        className="w-full bg-gray-100 rounded-lg py-2 px-4 flex justify-between items-center focus:outline-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="font-semibold">
          {meeting.channelName} - {convertUNIXToString(meeting.id)}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform ${
            isCollapsed ? "rotate-0" : "rotate-180"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3.333a.833.833 0 00-.833.833v11.667c0 .46.373.833.833.833.46 0 .833-.373.833-.833V4.166a.833.833 0 00-.833-.833zm-3.334 3.334a.833.833 0 00-.833.833v5c0 .46.373.833.833.833s.833-.373.833-.833v-5a.833.833 0 00-.833-.833zm6.668 0a.833.833 0 00-.833.833v5c0 .46.373.833.833.833s.833-.373.833-.833v-5a.833.833 0 00-.833-.833z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="mt-5">
          {meeting.recordings
            .sort(
              (a, b) =>
                Number(a.split("/").pop()?.split("-")[0]) -
                Number(b.split("/").pop()?.split("-")[0])
            )
            .map((recording: string) => (
              <div key={recording}>
                <h2 className="text-xl font-semibold mb-0">
                  {recording.split("/").pop()?.split("-")[1].split("_")[0]} -{" "}
                  {convertUNIXToString(
                    recording.split("/").pop()?.split("-")[0]!,
                    "%I:%M:%S %p"
                  )}
                </h2>
                <audio className="w-full" controls src={recording}></audio>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
