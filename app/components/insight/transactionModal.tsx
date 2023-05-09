import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BanknotesIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type Meeting } from "~/utils/db";
import { createSupabaseClient } from "~/utils/supabase";
import type { DiscordUser } from "~/auth.server";
import { TemplateBuilder } from "./templateBuilder";

type prop = {
  meeting: Meeting | undefined;
  supabaseKey: string | undefined;
  user: DiscordUser;
  fetchInsights: () => void;
};

const INSIGHT_GENERATION_COST = 0;

const preBuiltTemplates: Record<number, string[]> = {
  0: ["Subject", "Summary", "Action Items (by participants)"],
  1: ["Subject", "Summary", "Frequently Asked Questions (by participant)"],
};

export const GenerateInsight: React.FC<prop> = ({
  meeting,
  supabaseKey,
  user,
  fetchInsights,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [inputFields, setInputFields] = useState<string[]>(
    preBuiltTemplates[0]
  );

  const cancelButtonRef = useRef(null);

  const handleSetInputFields = (value: string[]) => {
    setInputFields(value);
  };

  const supabase = createSupabaseClient(supabaseKey!);

  useEffect(() => {
    setLoading(true);
    const getCredits = async () => {
      try {
        const credits = await supabase.getUserCredits(user);
        setUserCredits(credits);
      } catch (error) {
        console.log(error);
      }
    };
    getCredits();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCredits]);

  const handleTransaction = async () => {
    await directToPurchase();
  };

  const directToPurchase = async () => {
    // window.open(
    //   `https://oneshot.lemonsqueezy.com/checkout?cart=1a360fe5-70f9-421a-a448-79d11ab0ace1`,
    //   "_blank"
    // );
    try {
      //TODO
      await supabase.addCredit(user, userCredits, 100);
      setUserCredits(userCredits + 100);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e: any) => {
    setLoading(true);
    let formData = new FormData();

    formData.append("requestType", JSON.stringify("generateInsightForMeeting"));
    formData.append("inputFields", JSON.stringify(inputFields));
    formData.append("guildId", JSON.stringify(meeting!.guildId));
    formData.append("channelId", JSON.stringify(meeting!.channelId));
    formData.append("meetingId", JSON.stringify(meeting!.id));
    formData.append("userId", JSON.stringify(user.id));
    formData.append("userCredits", JSON.stringify(userCredits));
    formData.append(
      "insightGenerationCost",
      JSON.stringify(INSIGHT_GENERATION_COST)
    );

    await fetch(
      `/dashboard/guilds/${meeting!.guildId}/meetings/${meeting!.channelId}-${
        meeting!.id
      }`,
      {
        method: "POST",
        body: formData,
      }
    );
    setLoading(false);
    // await fetchInsights();
    setOpen(false);
  };
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded-full"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="text-white stroke-2 h-5 w-5" />
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={(v) => {
            if (!loading) setOpen(v);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 sm:mx-0 sm:h-10 sm:w-10">
                        <BanknotesIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center w-full sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h1"
                          className="text-xl font-bold leading-6 text-gray-900"
                        >
                          Insight Generation Confirmation
                        </Dialog.Title>
                        {loading ? (
                          <div className="flex justify-center mt-3">
                            <h2 className="text-sm font-bold leading-6 text-sky-700">
                              If this is a long meeting, this may take a few
                              minutes. Please do not close this window or
                              refresh the page. But you can probably go get a
                              coffee.
                            </h2>
                          </div>
                        ) : (
                          <TemplateBuilder
                            inputFields={inputFields}
                            setInputFields={handleSetInputFields}
                            preBuiltTemplates={preBuiltTemplates}
                          />
                        )}
                        <HasEnoughCredits userCredits={userCredits} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    {userCredits < INSIGHT_GENERATION_COST ? (
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                        onClick={handleTransaction}
                      >
                        <span>Purchase Credits </span>
                      </button>
                    ) : (
                      <>
                        {loading ? (
                          <button
                            type="button"
                            disabled
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                          >
                            <span>Generating...</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                            onClick={handleSubmit}
                          >
                            <span>Confirm</span>
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => {
                        if (!loading) setOpen(false);
                      }}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

type HasEnoughCreditsProp = {
  userCredits: number;
};
const HasEnoughCredits: React.FC<HasEnoughCreditsProp> = ({ userCredits }) => {
  return (
    <div className="mt-10 border rounded-lg p-4 w-full">
      <p className="text-sm font-semibold">Receipt Preview</p>
      <div className="border-b my-2"></div>
      <div className="flex justify-between">
        <p className="text-sm text-gray-700">Current Balance:</p>
        <p className="text-sm text-gray-700">{userCredits} credits</p>
      </div>
      <div className="flex justify-between">
        <p className="text-sm text-sky-800 font-bold">Cost:</p>
        <p className="text-sm text-sky-800 font-bold">
          {INSIGHT_GENERATION_COST === 0
            ? "free"
            : `${INSIGHT_GENERATION_COST} credits`}
        </p>
      </div>
      <div className="border-t my-2"></div>
      <div className="flex justify-between">
        <p className="text-sm text-gray-700">New Balance:</p>
        <p className="text-sm text-gray-700">
          {userCredits < INSIGHT_GENERATION_COST ? (
            <span className="text-red-500">
              {userCredits - INSIGHT_GENERATION_COST} credits
            </span>
          ) : (
            <span className="text-green-500">
              {userCredits - INSIGHT_GENERATION_COST} credits
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
