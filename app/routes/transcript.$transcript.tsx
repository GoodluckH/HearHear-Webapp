import {
  json,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Transcript } from "~/utils/db";
import { downloadRecordingsAsZip, getTranscripts } from "~/utils/db";
import { convertUNIXToString } from "~/utils/timestamp";
import { SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { auth } from "~/auth.server";
import { saveAs } from "file-saver";

export const loader: LoaderFunction = async ({ request }) => {
  const match = request.url.split("/").pop()!.split("-");

  const guildId = match[0];
  const channelId = match[1];
  const meetingId = match[2];

  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // check if user's guild has guildId
  const userGuildIds = user.guilds ? user.guilds.map((guild) => guild.id) : [];
  if (!userGuildIds.includes(guildId)) {
    return "Unauthorized";
  }

  const transcripts = await getTranscripts(
    guildId,
    channelId,
    meetingId,
    process.env.S3_BUCKET_REGION!,
    process.env.S3_BUCKET_NAME!,
    process.env.AWS_ACCESS_KEY_ID!,
    process.env.AWS_SECRET_ACCESS_KEY!
  );

  return {
    transcripts,
    guildId,
    channelId,
    meetingId,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const match = request.url.split("/").pop()!.split("-");

  const guildId = match[0];
  const channelId = match[1];
  const meetingId = match[2];

  await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const data = await downloadRecordingsAsZip(
    guildId,
    channelId,
    meetingId,
    process.env.S3_BUCKET_REGION!,
    process.env.S3_BUCKET_NAME!
  );

  return json(data);
};

export default function TranscriptPage() {
  const authorization = useLoaderData<string | null>();
  const { transcripts, guildId, channelId, meetingId } = useLoaderData<{
    transcripts: Array<Transcript>;
    guildId: string;
    channelId: string;
    meetingId: string;
  }>();
  const [currentTranscriptId, setCurrentTranscriptId] = useState<number | null>(
    null
  );

  const [downloadingRecordings, setDownloadingRecordings] = useState(false);

  const data = useActionData<typeof action>();
  const [recordingData, setRecordingData] = useState(null);

  useEffect(() => {
    if (data) {
      setRecordingData(data);
      console.log(data);
    }
  }, []);

  if (authorization === "Unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">
          You do not have permission to view this page.
        </h1>
      </div>
    );
  }

  if (transcripts === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">No transcripts found</h1>
      </div>
    );
  }
  async function handleDownload() {
    setDownloadingRecordings(true);

    let formData = new FormData();
    formData.append("guildId", JSON.stringify(guildId));
    formData.append("channelId", JSON.stringify(channelId));
    formData.append("meetingId", JSON.stringify(meetingId));

    const res = await fetch(
      `/transcript/${guildId}-${channelId}-${meetingId}`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const text = await res.text();
    console.log(text);

    // const body = await res.body?.getReader().read();
    // if (body === undefined || body.value === undefined) {
    //   setDownloadingRecordings(false);
    //   return;
    // }

    // const blob = new Blob([body.value], { type: "application/zip" });
    // console.log(blob);

    // saveAs(blob, `${meetingId}.zip`);

    setDownloadingRecordings(false);
  }

  return (
    <div className="mt-5 p-5 mx-auto">
      {/* <button
        className={`bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded mt-5 border-white border-2 ${
          downloadingRecordings && "opacity-50 cursor-not-allowed"
        }`}
        disabled={downloadingRecordings}
        onClick={handleDownload}
      >
        {downloadingRecordings ? "Downloading" : "Download Recordings"}
      </button> */}
      {transcripts
        .sort(
          (a, b) =>
            Number(a.filename.split("-")[0]) - Number(b.filename.split("-")[0])
        )
        .map((transcript, id) => (
          <div key={id} className="border-b py-4">
            {/* Render audio player */}
            {/* {currentAudio === transcript.audio_link && (
              <audio
                className="hidden"
                autoPlay
                controls={false}
                onEnded={() => setCurrentAudio("")}
                src={transcript.audio_link}
              ></audio>
            )} */}
            <h2 className="text-xl font-semibold mb-0 flex items-center">
              {transcript.filename.split("-")[1].slice(0, -4)} -{" "}
              {convertUNIXToString(
                transcript.filename.split("-")[0]!,
                "%I:%M:%S %p"
              )}
              {currentTranscriptId === id && (
                <span className="ml-3">
                  <SpeakerWaveIcon className="text-gray-500 stroke-2 h-5 w-5" />
                </span>
              )}
            </h2>
            {/* Add onClick event handler to transcript text */}
            <div
              // className="p-4 mb-5 text-gray-600 text-lg cursor-pointer hover:border-gray-200 hover:border hover:rounded-lg hover:shadow-lg"
              className="p-4 mb-5 text-gray-600 text-lg"
              // onClick={() => handleClick(transcript, id)}
            >
              {transcript.text}
            </div>
          </div>
        ))}
    </div>
  );
}
