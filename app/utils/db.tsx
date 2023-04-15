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
  recordings: string[]; // the recording paths
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

  await Promise.all(
    files.map(async (file) => {
      const [guildId, channelId, meetingId] = file.split("/");
      const channelName = await getChannelNameById(channelId);
      const meeting = meetings[meetingId];
      if (meeting) {
        meeting.recordings.push(`${S3_PUBLIC_URL}${file}`);
      } else {
        meetings[meetingId] = {
          id: meetingId,
          guildId,
          channelName,
          recordings: [`${S3_PUBLIC_URL}${file}`],
        };
      }
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