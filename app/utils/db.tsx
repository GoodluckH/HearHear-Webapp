import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { config } from "dotenv";
import { getChannelNameById } from "./discord";
config();

const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_PUBLIC_URL = `https://${S3_BUCKET_NAME}.s3.${S3_BUCKET_REGION}.amazonaws.com/`;

const client = new S3Client({
  region: S3_BUCKET_REGION!,
});

export interface Meeting {
  id: string; // the meeting id; which is also a unix timestamp
  guildId: string; // the guild id
  channelName: string; // the channel id
  transcripts: Transcript[]; // the transcript path
}

export interface Transcript {
  filename: string;
  audio_link: string;
  text: string;
}

export async function getTextFromUrl(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export async function getRecordingFileAsBase64(filePath: string) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME!,
    Key: filePath,
  });
  const { Body } = await client.send(command);
  if (Body === undefined) return Buffer.from("");
  return Body;
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

  text_files.map(async (file) => {
    const [guildId, channelId, meetingId, filename] = file.split("/");
    let channelName = channelNameCache[channelId];
    const meeting = meetings[meetingId];

    const transcript = {
      filename,
      audio_link: `${S3_PUBLIC_URL}${guildId}/${channelId}/${meetingId}/${filename.replace(
        ".txt",
        ".ogg"
      )}`,
      text: `${S3_PUBLIC_URL}${guildId}/${channelId}/${meetingId}/${filename}`,
    };

    if (meeting) {
      meeting.transcripts.push(transcript);
    } else {
      meetings[meetingId] = {
        id: meetingId,
        guildId,
        channelName,
        transcripts: [transcript],
      };
    }
  });

  await Promise.all(
    Object.keys(meetings).map(async (meetingId) => {
      const meeting = meetings[meetingId];
      await Promise.all(
        meeting.transcripts.map(async (transcript) => {
          transcript.text = await getTextFromUrl(transcript.text);
        })
      );
    })
  );

  return Object.values(meetings);
}

export async function getRecordingPathAsStrings(
  guildId: string
): Promise<string[]> {
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

export async function getMeetings(guildId: string) {
  const files = await getRecordingPathAsStrings(guildId);
  return await buildMeetings(files);
}

// getMeetings("280715328219250689").then((meetings) => {
//   meetings.forEach((meeting) => {
//     console.log(meeting.transcripts);
//   });
// });
