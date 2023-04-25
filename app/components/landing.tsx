import { Link } from "@remix-run/react";
import Planets from "~/assets/planets.png";
import HearHearVid from "~/assets/hearhear-demo.mp4";
import * as OrangeRocket from "~/assets/lottie/orange-rocket.json";
import { useLottie } from "lottie-react";

import {
  BoltIcon,
  PlusIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Login from "~/routes/login";

export default function LandingPage() {
  const { View } = useLottie({
    animationData: OrangeRocket,
    loop: true,
  });
  return (
    <div className="bg-black">
      <div className="bg-black pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="max-w-xl md:w-1/2 md:pr-10 py-6">
            <h1 className="text-4xl font-extrabold text-yellow-300 sm:text-5xl sm:tracking-tight lg:text-6xl">
              <span className="block">
                10x your daily{" "}
                <span className="block text-white">meetings</span>
              </span>
            </h1>
            <p className="mt-5 text-xl text-gray-400">
              Transform your meetings into actionable insights. With HearHear,
              say goodbye to missed tasks and forgotten ideas.
            </p>
            <div className="mt-10">
              <Login />
            </div>
          </div>
          <div className="hidden md:block md:w-1/2">
            <img src={Planets} alt="planets" className="" />
          </div>
        </div>
      </div>

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
                      private voice channels.
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
                      When you're in a voice channel, type{" "}
                      <code className="text-black border-gray-500 border-2 rounded-md p-1">
                        /start
                      </code>{" "}
                      in any text channel. The bot will join the voice channel
                      and start recording.
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
                        /leave
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

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-col md:flex-col lg:flex-row items-center">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
                Features
              </h2>
              <div className="mt-10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                      <PlusIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Generate To-Do Lists
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      HearHear automatically generates to-do lists based on your
                      conversations, making it easy to stay on track and get
                      things done.
                    </p>
                  </div>
                </div>
                <div className="mt-10 flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                      <BoltIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Generate Insights
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      HearHear also generates insights based on your
                      conversations, helping you to identify key themes and take
                      action on them.
                    </p>
                  </div>
                </div>
                <div className="mt-10 flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                      <CheckBadgeIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Easy to Use
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      HearHear is a Discord bot, making it easy to integrate
                      into your existing workflow. Simply add the bot to your
                      server and start using it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto  px-4 hidden lg:block sm:px-6 lg:px-8 z-0">
            <div className="max-w-md">{View}</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl sm:tracking-tight lg:text-5xl">
              Got a question?
            </h2>
            <p className="mt-5 text-xl text-gray-400">
              If you have any questions, feel free to reach out to me on
              Twitter. I'm always happy to help!
            </p>
            <div className="mt-8 space-x-3">
              <a
                href="https://twitter.com/theXipuLi"
                target="_blank"
                className="inline-block bg-sky-500 py-3 px-6 border border-transparent rounded-md font-medium text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                rel="noreferrer"
              >
                Drop a dm
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            <div className="px-5 py-2">
              <Link
                to="/privacy"
                className="text-base text-gray-500 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link
                to="/terms"
                className="text-base text-gray-500 hover:text-gray-900"
              >
                Terms and Conditions
              </Link>
            </div>
          </nav>
          <div className="mt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date(Date.now()).getFullYear()} HearHear. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
