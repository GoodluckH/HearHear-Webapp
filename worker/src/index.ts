import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { createSupabaseClient } from "./supabase";
import { generateInsightFromTranscript } from "./openai";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_BUCKET_REGION: string;
  SUPABASE_KEY: string;
  OPENAI_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const data: any = await request.json();

    if (data.requestType === "getParticipantsForMeeting") {
      return handleGetParticipantsForMeeting(data, env);
    }

    if (data.requestType === "generateInsightForMeeting") {
      return handleGenerateInsightForMeeting(data, env);
    }

    if (data.requestType === "getTranscriptForMeeting") {
      return handleGetTranscriptForMeeting(data, env);
    }

    return new Response("Hello World!", {
      headers: { "Content-Type": "application/json" },
    });
  },
};
export interface Transcript {
  filename: string;
  audio: Promise<Uint8Array> | null;
  text: string;
}

export interface ProcessedTranscript {
  username: string;
  timestamp: string;
  text: string;
}

async function handleGenerateInsightForMeeting(data: any, env: Env) {
  const supabase = createSupabaseClient(env.SUPABASE_KEY);
  await supabase.createInsight(
    data.guildId,
    data.channelId,
    data.meetingId,
    data.userId
  );
  try {
    const processedTranscripts = await supabase.getTranscript(data.meetingId);

    console.log("processed transcripts", processedTranscripts);

    if (processedTranscripts === null || processedTranscripts.length === 0) {
      await supabase.logErrorMessage("No transcripts found", data.meetingId);
      return new Response("No transcripts found or error fetching transcripts");
    }

    const insightText = await generateInsightFromTranscript(
      processedTranscripts,
      env.OPENAI_API_KEY,
      data.inputFields,
      supabase,
      data.meetingId
    );
    console.log(insightText);

    await supabase.updateInsightStatus(
      data.meetingId,
      data.userId,
      insightText,
      "complete"
    );

    // await supabase.addCredit(
    //   ,
    //   Number(userCredits),
    //   -Number(INSIGHT_GENERATION_COST)
    // );
    return new Response("OK");
  } catch (e) {
    await supabase.logErrorMessage("error " + e, data.meetingId);
    return new Response("error getting processed transcripts");
  }
}

async function handleGetTranscriptForMeeting(data: any, env: Env) {
  const transcripts = await getTranscriptForMeeting(
    data.guildId,
    data.channelId,
    data.meetingId,
    env
  );

  if (transcripts === null) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(transcripts), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetParticipantsForMeeting(data: any, env: Env) {
  const participants = await getParticipantsForMeeting(
    data.guildId,
    data.channelId,
    data.meetingId,
    env
  );
  if (participants === null) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(Array.from(participants)), {
    headers: { "Content-Type": "application/json" },
  });
}

async function getParticipantsForMeeting(
  guildId: string,
  channelId: string,
  meetingId: string,
  env: Env
) {
  const client = new S3Client({
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new ListObjectsV2Command({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: guildId + "/" + channelId + "/" + meetingId,
  });

  try {
    let isTruncated = true;
    let contents: string[] = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await client.send(command);

      if (Contents === undefined || IsTruncated === undefined) break;
      Contents.map((c) => {
        if (c.Key !== undefined) contents.push(c.Key);
        return null;
      });
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    const transcriptFilePaths = contents.filter((c) => c.endsWith(".txt"));
    const participants: Set<string> = new Set();
    transcriptFilePaths.map((file) => {
      const filename = file.split("/")[3];

      const participantId = filename.split("-")[1].slice(0, -4);
      participants.add(participantId);
      return null;
    });

    return participants;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getTranscriptForMeeting(
  guildId: string,
  channelId: string,
  meetingId: string,
  env: Env
) {
  const client = new S3Client({
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new ListObjectsV2Command({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: guildId + "/" + channelId + "/" + meetingId,
  });

  try {
    let isTruncated = true;
    let contents: string[] = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await client.send(command);

      if (Contents === undefined || IsTruncated === undefined) break;
      Contents.map((c) => {
        if (c.Key !== undefined) contents.push(c.Key);
        return null;
      });
      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }

    const transcriptFilePaths = contents.filter((c) => c.endsWith(".ogg"));
    const result: Array<{ filename: string; data: Uint8Array }> = [];

    await Promise.all(
      transcriptFilePaths.map(async (transcriptPath) => {
        const byteArray = await getRecordingFileAsByteArray(
          transcriptPath,
          env.S3_BUCKET_REGION,
          env.S3_BUCKET_NAME
        );

        result.push({
          filename: transcriptPath.split("/").pop()!,
          data: byteArray || new Uint8Array(),
        });
      })
    );

    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getRecordingFileAsByteArray(
  filePath: string,
  region: string,
  bucketName: string
) {
  const s3 = new S3Client({
    region,
  });

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  const response = await s3.send(command);
  const buffer = await response.Body?.transformToByteArray();
  return buffer;
}
