import {
  useInsightArrayEffect,
  useRouteData,
  useRouteParam,
} from "~/utils/hooks";
import { type Meeting } from "~/utils/db";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { GenerateInsight } from "~/components/insight/transactionModal";
import type { DiscordUser } from "~/auth.server";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import type { Insight } from "~/utils/supabase";
import { createSupabaseClient } from "~/utils/supabase";
import ReactMarkdown from "react-markdown";
import * as NoMeetingAnimation from "~/assets/lottie/no-meeting.json";
import { useLottie } from "lottie-react";
import { Participants } from "~/components/participants";
import { convertUNIXToString } from "~/utils/timestamp";

export const loader: LoaderFunction = () => {
  return json({
    openai_key: process.env.OPENAI_API_KEY,
    supabaseKey: process.env.SUPABASE_KEY,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const supabase = createSupabaseClient(process.env.SUPABASE_KEY!);
  const data = await request.formData();

  const requestType = JSON.parse(data.get("requestType")?.toString() || "");
  const inputFields = JSON.parse(data.get("inputFields")?.toString() || "[]");
  const guildId = JSON.parse(data.get("guildId")?.toString() || "{}");
  const channelId = JSON.parse(data.get("channelId")?.toString() || "{}");
  const meetingId = JSON.parse(data.get("meetingId")?.toString() || "{}");
  const userId = JSON.parse(data.get("userId")?.toString() || "{}");

  console.log(requestType, inputFields, guildId, channelId, meetingId, userId);

  await supabase.saveProcessedTranscripts(
    guildId,
    channelId,
    meetingId,
    process.env.S3_BUCKET_REGION!,
    process.env.S3_BUCKET_NAME!
  );

  console.log("saved processed transcripts");

  fetch("https://worker.xipu-li5458.workers.dev", {
    method: "POST",
    body: JSON.stringify({
      requestType,
      inputFields,
      guildId,
      channelId,
      meetingId,
      userId,
    }),
  }).catch((err) => console.log(err));

  return null;
};

export default function MeetingPage() {
  let { supabaseKey } = useLoaderData<typeof loader>();
  const action = useActionData<string | null>();

  const meetings =
    useRouteData<Meeting[]>("routes/dashboard.guilds.$guild") || [];

  const user = useRouteData<{ user: DiscordUser }>("root")?.user;
  const meetingId = useRouteParam<string>("routes/dashboard", "meeting")?.split(
    "-"
  )[1];

  const thisMeeting = meetings.find((meeting) => meeting.id === meetingId);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [pendingJob, setPendingJob] = useState<boolean>(false);

  const supabase = createSupabaseClient(supabaseKey!);
  const supabaseClient = supabase.getClient();

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const retrievedInsights = await supabase.getInsights(thisMeeting!.id);

    setInsights(retrievedInsights);
    setLoadingInsights(false);
  };

  useEffect(() => {
    const channel = supabaseClient
      .channel(`insights`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "insights",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchInsights();
          setPendingJob(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "insights",
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          setPendingJob(true);
        }
      )
      .subscribe();

    return () => {
      if (channel.state === "joined") supabaseClient.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseClient]);

  useInsightArrayEffect(() => {
    fetchInsights();
  }, [insights, thisMeeting!.id, action]);

  return (
    <div className="p-10 min-h-screen whitespace-pre-line  max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center">
        Insight
        <span className="ml-3">
          <GenerateInsight
            meeting={thisMeeting}
            supabaseKey={supabaseKey}
            user={user!}
            fetchInsights={fetchInsights}
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
        <Participants meeting={thisMeeting!} />

        <div className="border-b-2 border-gray-200 "></div>
        <h1 className="text-xl font-bold mt-10">Insights</h1>
        <p className="text-gray-500 text-sm mt-2">
          {pendingJob && (
            <ul>
              <li>✔️ processed all transcripts</li>
              {/* make the li fade in and out */}
              <li className="animate-pulse">
                ⏳ generating insights (this might take minutes if it's a large
                meeting. time to grab a coffee!)
              </li>
            </ul>
          )}
        </p>
        {loadingInsights ? (
          <div className="mt-5">Loading...</div>
        ) : (
          <Collapsible insights={insights} />
        )}
      </div>
    </div>
  );
}

function Collapsible({ insights }: { insights: Insight[] }) {
  const options = {
    animationData: NoMeetingAnimation,
    loop: true,
  };

  const { View } = useLottie(options);
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center h-full">
        <div className="w-40 h-40">{View}</div>
        <p className="text-md font-bold text-gray-600 mt-5">
          No insights generated yet
        </p>
      </div>
    );
  }
  return (
    <div className="mt-5">
      {insights.map((insight, id) => (
        <div key={id}>
          <CollapsibleItem insight={insight} />
        </div>
      ))}
    </div>
  );
}

function CollapsibleItem({ insight }: { insight: Insight }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b-2 border-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          Generated by {insight.displayName} -{" "}
          {convertUNIXToString(String(Date.parse(insight.created_at)))}
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded-full"
        >
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>
      {isOpen && (
        <div className="mt-5">
          <ReactMarkdown>{insight.text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
