import * as OrangeRocket from "~/assets/lottie/orange-rocket.json";
import { useLottie } from "lottie-react";

import {
  BoltIcon,
  PlusIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function Features() {
  const { View } = useLottie({
    animationData: OrangeRocket,
    loop: true,
  });
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-col md:flex-col lg:flex-row items-center">
        <div className="max-w-full py-16 px-4 sm:py-24 sm:px-6">
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
                    HearHear is a Discord bot, making it easy to integrate into
                    your existing workflow. Simply add the bot to your server
                    and start using it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" mx-auto px-4 hidden lg:block sm:px-6 lg:px-8 z-0">
          <div className="max-w-lg">{View}</div>
        </div>
      </div>
    </div>
  );
}
