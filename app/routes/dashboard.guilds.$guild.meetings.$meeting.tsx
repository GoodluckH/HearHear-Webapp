import type { FC } from "react";
import { useState } from "react";
import { generateInsightFromTranscript } from "~/utils/ai";
import { useRouteData, useRouteParam } from "~/utils/data";
import type { Meeting, Transcript } from "~/utils/db";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { convertUNIXToString } from "~/utils/timestamp";

export async function loader() {
  return json({ openai_key: process.env.OPENAI_API_KEY });
}

export default function MeetingPage() {
  let { openai_key } = useLoaderData<typeof loader>();

  const meetings =
    useRouteData<Meeting[]>("routes/dashboard.guilds.$guild") || [];
  const meetingId = useRouteParam<string>("routes/dashboard", "meeting");

  const thisMeeting = meetings.find((meeting) => meeting.id === meetingId);

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<any>(null);

  const generateInsight = async () => {
    setLoading(true);
    const result = await generateInsightFromTranscript(
      thisMeeting?.transcripts || [],
      openai_key || ""
    );
    const participants = result[0];
    const insightText = result[1];

    if (participants !== null && insightText !== null) {
      setInsight([participants, insightText]);
    }
    setLoading(false);
  };

  return (
    <div className="p-10 min-h-screen whitespace-pre-line  max-w-4xl">
      <h1 className="text-3xl font-bold">Insight</h1>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-10"
        onClick={generateInsight}
      >
        Generate Insight
      </button>

      {loading && (
        <div className="flex items-center justify-center mt-10">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      {insight && (
        <div className="mt-10">
          <h1 className="text-2xl font-bold">Participants</h1>
          <ul className="list-disc ml-5">
            {[...insight[0]].map((participant: string, id: any) => (
              <li key={id}>{participant}</li>
            ))}
          </ul>
          <h1 className="text-2xl font-bold mt-10">Insight</h1>

          <div dangerouslySetInnerHTML={{ __html: insight[1] }} />
        </div>
      )}
      {thisMeeting && <Collapsible meeting={thisMeeting} />}
    </div>
  );
}

interface MeetingProp {
  meeting: Meeting;
}

const Collapsible: FC<MeetingProp> = ({ meeting }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="my-3 mt-10">
      <button
        className=" w-full bg-gray-100 rounded-lg py-2 px-4 flex justify-between items-center focus:outline-none sticky top-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="font-semibold">Raw Transcript</div>
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
        <div className="mt-5 p-5">
          {meeting.transcripts
            .sort(
              (a, b) =>
                Number(a.filename.split("-")[0]) -
                Number(b.filename.split("-")[0])
            )
            .map((transcript: Transcript, id: any) => (
              <div key={id}>
                {/* <audio
                    className="mr-4"
                    preload="none"
                    controls
                    src={transcript.audio_link}
                  ></audio> */}

                <h2 className="text-xl font-semibold mb-0">
                  {transcript.filename.split("-")[1].split("_")[0]} -{" "}
                  {convertUNIXToString(
                    transcript.filename.split("-")[0]!,
                    "%I:%M:%S %p"
                  )}
                </h2>
                <div className="mb-5">{transcript.text}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
