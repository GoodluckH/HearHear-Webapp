import { useRouteData, useRouteParam } from "~/utils/hooks";
import type { Meeting } from "~/utils/db";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GenerateInsight } from "~/components/insightTransaction";
import type { DiscordUser } from "~/auth.server";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export async function loader() {
  return json({
    openai_key: process.env.OPENAI_API_KEY,
    supabaseKey: process.env.SUPABASE_KEY,
    S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  });
}

export default function MeetingPage() {
  let { openai_key, supabaseKey, S3_BUCKET_REGION, S3_BUCKET_NAME } =
    useLoaderData<typeof loader>();

  const meetings =
    useRouteData<Meeting[]>("routes/dashboard.guilds.$guild") || [];

  const user = useRouteData<{ user: DiscordUser }>("root")?.user;
  const meetingId = useRouteParam<string>("routes/dashboard", "meeting");

  const thisMeeting = meetings.find((meeting) => meeting.id === meetingId);

  return (
    <div className="p-10 min-h-screen whitespace-pre-line  max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center">
        Insight
        <span className="ml-3">
          <GenerateInsight
            meeting={thisMeeting}
            supabaseKey={supabaseKey}
            openaiKey={openai_key}
            user={user!}
            S3_BUCKET_REGION={S3_BUCKET_REGION!}
            S3_BUCKET_NAME={S3_BUCKET_NAME!}
          />
        </span>
        <span className="ml-3">
          <div className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-1 rounded-full">
            <Link
              to={`/transcript/${thisMeeting?.guildId}-${thisMeeting?.channelId}-${thisMeeting?.id}`}
              target="_blank"
            >
              <DocumentTextIcon className="text-white stroke-2 h-5 w-5" />
            </Link>
          </div>
        </span>
      </h1>

      <div className="mt-10">
        <h1 className="text-xl font-bold">Participants</h1>
        <ul className="list-disc ml-5">
          {thisMeeting!.participants.map((participant: string, id: any) => (
            <li key={id}>{participant.split("_")[0]}</li>
          ))}
        </ul>
        {/* separator line */}
        <div className="border-b-2 border-gray-200 "></div>
        {/* {insight && (
          <h1 className="text-2xl font-bold mt-10">Insight</h1>

          <div dangerouslySetInnerHTML={{ __html: insight[1] }} />
          )} */}
      </div>
    </div>
  );
}
