import * as noServerSelectedAnimation from "~/assets/lottie/no-server-selected.json";
import { useLottie } from "lottie-react";
import { useRouteData } from "~/utils/data";
import type { DashboardProps } from "./dashboard";

export default function DashboardIndex() {
  const guilds = useRouteData<DashboardProps>("routes/dashboard")?.guilds;

  const options = {
    animationData: noServerSelectedAnimation,
    loop: true,
  };

  const guilds_with_bots =
    guilds?.filter((guild) => guild.hasHearHearBot) || [];

  const { View } = useLottie(options);
  return (
    <>
      <div className="flex flex-col items-center  h-full">
        <div className="w-96 h-96">{View}</div>
        <h1 className="text-3xl font-bold mb-0">nothing to see here...</h1>
        <StackedAvatar
          size={50}
          avatars={guilds_with_bots.map((guild) => `${guild.id}/${guild.icon}`)}
        />

        <p className="text-gray-500 text-center">
          You have {guilds_with_bots.length} servers with HearHear installed.
          Select one to get started!
        </p>
      </div>
    </>
  );
}

export function StackedAvatar({
  size,
  avatars,
}: {
  size: number;
  avatars: string[];
}) {
  const style = {
    border: "4px solid white",
    marginLeft: -(size / 2) + "px",
  };

  return (
    <div style={{ marginLeft: size / 2 }}>
      {avatars.map((avatar, idx) => (
        <img
          key={idx}
          src={
            avatar === null
              ? "https://cdn.discordapp.com/embed/avatars/0.png"
              : `https://cdn.discordapp.com/icons/${avatar}`
          }
          alt="discord server icon"
          className="w-12 h-12 rounded-full object-cover mb-0 inline-block"
          style={style}
        />
      ))}
    </div>
  );
}
