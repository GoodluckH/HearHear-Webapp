import { useRouteData, useRouteParam } from "~/utils/data";
import type { DashboardProps } from "./dashboard";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return { status: 200 };
};

export default function Meeting() {
  const guilds = useRouteData<DashboardProps>("routes/dashboard")?.guilds || [];
  const guildId = useRouteParam<string>(
    "routes/dashboard.meetings.$meeting",
    "meeting"
  );

  const guild = guilds.find((guild) => guild.id === guildId);

  if (!guild) {
    return <div>Discord Server Not found</div>;
  }
  return (
    <div>
      <h1>Meetings for {guild.name}</h1>
      <img
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`}
        alt="discord server icon"
      />
    </div>
  );
}
