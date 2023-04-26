import Login from "~/routes/login";
import Planets from "~/assets/planets.png";

export default function HeadLine() {
  return (
    <div className="bg-black pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="max-w-xl px-4 md:w-1/2 md:pr-10 py-6">
          <h1 className="text-4xl font-extrabold text-yellow-300 sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="block">
              10x your daily <span className="block text-white">meetings</span>
            </span>
          </h1>
          <p className="mt-5 text-xl text-gray-400">
            Transform your meetings into actionable insights. With HearHear, say
            goodbye to missed tasks and forgotten ideas.
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
  );
}
