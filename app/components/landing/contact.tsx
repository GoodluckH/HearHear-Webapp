export default function Contact() {
  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:py-10 sm:px-6 lg:px-8">
        <div className="max-w-xl px-4 py-6 mx-auto lg:mx-0">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl sm:tracking-tight lg:text-5xl">
            Got a question?
          </h2>
          <p className="mt-5 text-xl text-gray-400">
            If you have any questions, feel free to reach out to me on Twitter.
            I'm always happy to help!
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
  );
}
