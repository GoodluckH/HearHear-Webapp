import type { Channel, DMChannel, PartialDMChannel } from "discord.js";
import { config } from "dotenv";
config();

export async function getChannelObject(channelId: string) {
  const response = await fetch(
    `https://discord.com/api/channels/${channelId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN || ""}`,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error("Channel not found");
  }
  return response.json();
}

export function getChannelName(
  channel: Exclude<Channel, DMChannel | PartialDMChannel>
) {
  return channel.name || "Unknown Channel";
}

getChannelObject("379054558594203648")
  .then((channel) => {
    console.log(getChannelName(channel!));
  })
  .catch((error) => {
    console.log(error);
  });
