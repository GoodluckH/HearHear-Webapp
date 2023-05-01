import { type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { Transcript } from "~/utils/db";
import { getTranscripts } from "~/utils/db";
import { convertUNIXToString } from "~/utils/timestamp";
import { SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { auth } from "~/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
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

  return await getTranscripts(
    guildId,
    channelId,
    meetingId,
    process.env.S3_BUCKET_REGION!,
    process.env.S3_BUCKET_NAME!,
    process.env.AWS_ACCESS_KEY_ID!,
    process.env.AWS_SECRET_ACCESS_KEY!
  );
};

export default function TranscriptPage() {
  const authorization = useLoaderData<string | null>();
  const transcripts = useLoaderData<Transcript[] | null>();
  const [currentTranscriptId, setCurrentTranscriptId] = useState<number | null>(
    null
  );

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

  // async function handleClick(transcript: Transcript, id: number) {
  //   setCurrentTranscriptId(id);
  //   console.log(transcript.audio);
  //   const bytes = await Promise.resolve(transcript.audio);
  //   const context = new window.AudioContext();

  //   function playByteArray(bytes: Uint8Array | null) {
  //     if (bytes === null) return;
  //     var buffer = new Uint8Array(bytes.length);
  //     buffer.set(new Uint8Array(bytes), 0);

  //     const context = new AudioContext();
  //     context.decodeAudioData(buffer.buffer, play);
  //   }

  //   function play(audioBuffer: any) {
  //     var source = context.createBufferSource();
  //     source.buffer = audioBuffer;
  //     source.connect(context.destination);
  //     source.start(0);
  //   }
  //   playByteArray(bytes);
  // }

  return (
    <div className="mt-5 p-5 mx-auto">
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
              className="p-4 mb-5 text-gray-600 text-lg cursor-pointer hover:border-gray-200 hover:border hover:rounded-lg hover:shadow-lg"
              // onClick={() => handleClick(transcript, id)}
            >
              {transcript.text}
            </div>
          </div>
        ))}
    </div>
  );
}
