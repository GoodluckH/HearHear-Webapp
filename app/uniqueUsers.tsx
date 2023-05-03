import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

async function getUniqueUsers() {
  const client = new S3Client({
    region: process.env.S3_BUCKET_REGION!,
  });

  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: "",
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

    const files = contents.filter((c) => c.endsWith(".txt"));
    const uniqueUsers = new Set<string>();

    files.map((file) => {
      const user = file.split("/").pop()!.split("-")[1].slice(0, -4);
      uniqueUsers.add(user);
      return null;
    });

    console.log("Unique users count: ", uniqueUsers.size);
    console.log("\nUsernames: \n", uniqueUsers);
  } catch (err) {
    console.log(err);
  }
}

getUniqueUsers();
