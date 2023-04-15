import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { config } from "dotenv";
config();

const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const client = new S3Client({
  region: S3_BUCKET_REGION!,
});

export interface Meeting {
  id: string; // the meeting id; which is also a unix timestamp
  guildId: string; // the guild id
  channelId: string; // the channel id
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

export function buildMeetings(files: string[]): Meeting[] {
  const meetings: Meeting[] = [];
  files.forEach((file) => {
    const [guildId, channelId, meetingId] = file.split("/");
    meetings.push({
      id: meetingId,
      guildId,
      channelId,
      recordings: [],
    });
  });
  return meetings;
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

    console.log("Your bucket contains the following objects:\n");
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
  return buildMeetings(files);
}
