import { Link } from "@remix-run/react";
import HearHearVid from "~/assets/hearhear-demo.mp4";
import StageIcon from "~/assets/Stage-Icon.svg";
import VoiceIcon from "~/assets/Voice-Icon.svg";

export default function HowHearHearWorks() {
  return (
    <div className="bg-gray-200 flex">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-col md:flex-col lg:flex-row items-center">
        <div className="max-w-xl sm:pr-10 mt-10">
          <video
            autoPlay
            muted
            loop
            id="myVideo"
            className="rounded-2xl shadow-2xl"
          >
            <source src={HearHearVid} type="video/mp4" />
          </video>
        </div>

        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
            How HearHear Works
          </h2>
          <div className="mt-5 space-y-6 text-sm text-gray-500 ">
            <p className="border-green-700 border-2 rounded-lg p-1 max-w-fit bg-green-200 bg-opacity-90">
              Supported Channel Types:
              <span>
                <img
                  src={VoiceIcon}
                  className="inline-block h-5 w-5 ml-2"
                  alt="Voice Channel"
                />
              </span>
              <span>
                <img
                  src={StageIcon}
                  className="inline-block h-5 w-5 ml-2"
                  alt="Stage Channel"
                />
              </span>
            </p>
          </div>
          <div className="max-w-xl">
            <div className="mt-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-300 text-black font-bold text-xl">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    <span
                      className="underline decoration-4 cursor-pointer"
                      onClick={() => {
                        window.open(
                          `https://discord.com/api/oauth2/authorize?client_id=1094729151514161204&permissions=380139210752&scope=applications.commands%20bot`,
                          "popup",
                          "width=600,height=600"
                        );
                      }}
                    >
                      Add the bot
                    </span>{" "}
                    to Your Server
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Make sure you assign the right roles for the bot to join
                    channels or stages that require permissions.
                  </p>
                </div>
              </div>
              <div className="mt-10 flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-300 text-black font-bold text-xl">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Start a Meeting
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    When you're in a voice channel or stage, type{" "}
                    <code className="text-black border-gray-500 border-2 rounded-md p-1">
                      /start
                    </code>{" "}
                    in any text channel. The bot will join the voice channel and
                    start recording.
                  </p>
                </div>
              </div>
              <div className="mt-10 flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-300 text-black font-bold text-xl">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Finish the Meeting
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Type{" "}
                    <code className="text-black border-gray-500 border-2 rounded-md p-1">
                      /end
                    </code>{" "}
                    in any text channel. The bot will leave the voice channel
                    and process the recording. You can see the meeting details
                    in the{" "}
                    <Link to="/dashboard" className="text-yellow-600">
                      dashboard
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
