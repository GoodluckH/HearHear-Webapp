import InsightGenerationVideo from "~/assets/insight-generation.mp4";

import {
  BoltIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function Features() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-col md:flex-col lg:flex-row items-center">
        <div className="max-w-full py-16 px-4 sm:py-24 sm:px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              Features
            </h2>

            <div className="mt-10 flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                  <BoltIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Generate Customized Insights
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  HearHear can generate any insight based on the templates you
                  built. Whether it's summary in haiku format, action items,
                  vibe check, or tension analysis, sky is the limit.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Raw Transcript Access
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    You can access the raw transcript with audio playback to
                    triple-check. No more unaddressed misunderstandings.
                  </p>
                </div>
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
                  your existing workflow. Simply add the bot to your server and
                  start using it.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block sm:px-0 lg:px-0 z-0">
          <div className="max-w-2xl mt-10">
            <video
              autoPlay
              muted
              loop
              id="myVideo"
              className="rounded-2xl shadow-2xl"
            >
              <source src={InsightGenerationVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
