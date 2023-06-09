import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getChannelNameById } from "./discord";
import { processTranscripts } from "./ai";

// const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
// const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
// const S3_PUBLIC_URL = `https://${S3_BUCKET_NAME}.s3.${S3_BUCKET_REGION}.amazonaws.com/`;

export interface Meeting {
  id: string; // the meeting id; which is also a unix timestamp
  guildId: string; // the guild id
  channelName: string; // the channel name
  channelId: string; // the channel id
  startTime: string; // the start time of the meeting in UNIX timestamp
  endTime: string; // the end time of the meeting in UNIX timestamp,
  // participants: string[]; // the participants of the meeting
}

export interface Transcript {
  filename: string;
  // audio: Promise<Uint8Array> | null;
  text: string;
  audio_link: string;
}

export interface ProcessedTranscript {
  username: string;
  timestamp: string;
  text: string;
}

export const CLOUDFRONT_URL = "https://dv46dfbzh6luw.cloudfront.net";

export async function downloadRecordingsAsZip(
  guildId: string,
  channelId: string,
  meetingId: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
) {
  const client = new S3Client({
    region: S3_BUCKET_REGION,
  });

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
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
          S3_BUCKET_REGION,
          S3_BUCKET_NAME
        );
        // convert byteArray to blob
        // const blob = new Blob([byteArray], { type: "audio/ogg" });
        result.push({
          filename: transcriptPath.split("/").pop()!,
          data: byteArray,
        });
      })
    );

    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getProcessedTranscripts(
  guildId: string,
  channelId: string,
  meetingId: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
): Promise<ProcessedTranscript[]> {
  const client = new S3Client({
    region: S3_BUCKET_REGION,
  });

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
    Prefix: guildId + "/" + channelId + "/" + meetingId,
  });

  try {
    let isTruncated = true;
    let contents: string[] = [];
    const transcripts: Transcript[] = [];

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

    await Promise.all(
      transcriptFilePaths.map(async (transcriptPath) => {
        const text = await getTextFromUrl(
          transcriptPath,
          S3_BUCKET_REGION,
          S3_BUCKET_NAME
        );

        transcripts.push({
          filename: transcriptPath.split("/").pop()!,
          // audio: null,
          text,
          audio_link:
            CLOUDFRONT_URL + "/" + transcriptPath.replace(".txt", ".ogg"),
        });
      })
    );

    return processTranscripts(transcripts);
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getTranscripts(
  guildId: string,
  channelId: string,
  meetingId: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string,
  AWS_ACCESS_KEY_ID: string,
  AWS_SECRET_ACCESS_KEY: string
) {
  const client = new S3Client({
    region: S3_BUCKET_REGION!,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME!,
    Prefix: guildId + "/" + channelId + "/" + meetingId,
  });

  try {
    let isTruncated = true;
    let contents: string[] = [];
    const transcripts: Transcript[] = [];

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
    await Promise.all(
      transcriptFilePaths.map(async (transcriptPath) => {
        const text = await getTextFromUrl(
          transcriptPath,
          S3_BUCKET_REGION,
          S3_BUCKET_NAME
        );

        transcripts.push({
          filename: transcriptPath.split("/").pop()!,
          // audio: null,
          text,
          audio_link:
            CLOUDFRONT_URL + "/" + transcriptPath.replace(".txt", ".ogg"),
        });
      })
    );

    return transcripts;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getTextFromUrl(
  url: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
) {
  try {
    const client = new S3Client({
      region: S3_BUCKET_REGION!,
    });

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME!,
      Key: url,
    });

    const { Body } = await client.send(command);
    if (Body === undefined) return "";
    return await Body.transformToString();
  } catch (err) {
    console.log(err);
    return "";
  }
}

export function getRecordingFileAsByteArray(
  filePath: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
) {
  return new Promise<Uint8Array>((resolve, reject) => {
    try {
      const client = new S3Client({
        region: S3_BUCKET_REGION!,
      });

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME!,
        Key: filePath,
      });

      client
        .send(command)
        .then(({ Body }) => {
          if (Body === undefined) reject();
          const byteArrayPromise = Body!.transformToByteArray();
          byteArrayPromise.then((byteArray) => {
            resolve(byteArray);
          });
        })
        .catch((err) => {
          console.log(err);
          resolve(new Uint8Array());
        });
    } catch (err) {
      console.log(err);
      reject();
    }
  });
}

export async function buildMeetings(files: string[]) {
  const meetings: Record<string, Meeting> = {};
  const channelNameCache: Record<string, string> = {};
  files.map((file) => {
    const [, channelId] = file.split("/");
    channelNameCache[channelId] = "";
    return null;
  });

  const text_files = files.filter((file) => file.endsWith(".txt"));

  await Promise.all(
    Object.keys(channelNameCache).map(async (channelId) => {
      const channelName = await getChannelNameById(channelId);
      channelNameCache[channelId] = channelName;
    })
  );
  const endTimes: Record<string, number> = {};
  // const participants: Record<string, Set<string>> = {};

  text_files.map((file) => {
    const meetingId = file.split("/")[2];
    const filename = file.split("/")[3];
    const timestamp = parseInt(filename.split("-")[0]);
    if (endTimes[meetingId] === undefined) endTimes[meetingId] = timestamp;
    if (timestamp > endTimes[meetingId]) endTimes[meetingId] = timestamp;

    // if (participants[meetingId] === undefined)
    //   participants[meetingId] = new Set();
    // const participantId = filename.split("-")[1].slice(0, -4);
    // participants[meetingId].add(participantId);
    return null;
  });

  text_files.map((file) => {
    const [guildId, channelId, meetingId] = file.split("/");
    let channelName = channelNameCache[channelId];

    meetings[meetingId] = {
      id: meetingId,
      guildId,
      channelId,
      channelName,
      startTime: meetingId,
      endTime: endTimes[meetingId].toString(),
      // participants: Array.from(participants[meetingId]),
    };
    return null;
  });

  return Object.values(meetings);
}

export async function getRecordingPathAsStrings(
  guildId: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
): Promise<string[]> {
  const client = new S3Client({
    region: S3_BUCKET_REGION!,
  });

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME!,
    Prefix: guildId,
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
    return contents;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMeetings(
  guildId: string,
  S3_BUCKET_REGION: string,
  S3_BUCKET_NAME: string
) {
  const files = await getRecordingPathAsStrings(
    guildId,
    S3_BUCKET_REGION,
    S3_BUCKET_NAME
  );
  return await buildMeetings(files);
}
