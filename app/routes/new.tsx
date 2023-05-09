import { Form } from "@remix-run/react";

export default function NewUser() {
  return (
    <div className="flex justify-center items-center flex-col">
      <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl mx-10">
        <span className="block">
          Wow, seems like you are new here! If you have just recorded a meeting,
          you can click "get started" below to visit the dashboard.
        </span>
      </h1>{" "}
      <Form action="/auth/discord" method="post">
        <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded mt-5 border-white border-2">
          ✨ get started ✨
        </button>
      </Form>
    </div>
  );
}
