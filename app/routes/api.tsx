import { Response, type ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();

  const requestType = JSON.parse(data.get("requestType")?.toString() || "");
  const guildId = JSON.parse(data.get("guildId")?.toString() || "");
  const channelId = JSON.parse(data.get("channelId")?.toString() || "");
  const meetingId = JSON.parse(data.get("meetingId")?.toString() || "");

  const res = await fetch(`https://worker.xipu-li5458.workers.dev/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      requestType,
      guildId,
      channelId,
      meetingId,
    }),
  });

  const json = await res.json();

  return new Response(JSON.stringify(json), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
