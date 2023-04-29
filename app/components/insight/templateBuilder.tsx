import {
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

type TemplateBuilderProp = {
  inputFields: string[];
  setInputFields: (...args: any) => void;
  preBuiltTemplates: Record<number, string[]>;
};

export const TemplateBuilder: React.FC<TemplateBuilderProp> = ({
  inputFields,
  setInputFields,
  preBuiltTemplates,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  //   const [inputFields, setInputFields] = useState<string[]>(
  //     preBuiltTemplates[selectedTemplate]
  //   );

  return (
    <div className="mt-2 ml-[-4]">
      <h1 className="text-md font-bold text-black">Select a Template</h1>
      <p className="text-sm text-gray-600">
        Select a template to generate insights from, or create your own by
        entering section names. To have accurate result, please make sure to
        have some description of the field in parenthesis.
      </p>
      {/* horizontal icons */}
      <div className="w-full flex flex-row items-center justify-center mt-3 mx-auto">
        <div className="flex flex-col items-center justify-center mx-auto">
          <button
            className={`hover:bg-yellow-400 text-white font-bold p-1 rounded-lg ${
              selectedTemplate === 0
                ? "ring-1 ring-yellow-500 bg-yellow-400"
                : "bg-gray-400"
            } `}
            onClick={() => {
              setSelectedTemplate(0);
              setInputFields(preBuiltTemplates[0]);
            }}
          >
            <DocumentTextIcon className="text-white stroke-2 h-10 w-10 p-1" />
          </button>
          <p className="text-xs font-bold text-gray-600 mt-1">Memo</p>
        </div>
        <div className="flex flex-col items-center justify-center mx-auto">
          <button
            className={` hover:bg-yellow-400 text-white font-bold p-1 rounded-lg ${
              selectedTemplate === 1
                ? "ring-1 ring-yellow-500 bg-yellow-400"
                : "bg-gray-400"
            } `}
            onClick={() => {
              setSelectedTemplate(1);
              setInputFields(preBuiltTemplates[1]);
            }}
          >
            <QuestionMarkCircleIcon className="text-white stroke-2 h-10 w-10 p-1" />
          </button>
          <p className="text-xs font-bold text-gray-600 mt-1">FAQ</p>
        </div>
        <div className="flex flex-col items-center justify-center mx-auto">
          <button
            className={` hover:bg-yellow-400 text-white font-bold p-1 rounded-lg ${
              selectedTemplate === 2
                ? "ring-1 ring-yellow-500 bg-yellow-400"
                : "bg-gray-400"
            } `}
            onClick={() => {
              setSelectedTemplate(2);
              setInputFields([]);
            }}
          >
            <Cog6ToothIcon className="text-white stroke-2 h-10 w-10 p-1" />
          </button>
          <p className="text-xs font-bold text-gray-600 mt-1">Custom</p>
        </div>
      </div>
      {/* input fields */}
      <div className="w-full mt-6 space-y-2 rounded-lg border border-gray-300 p-2">
        <ul className="max-h-[10rem]  overflow-auto">
          {inputFields.map((field, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg hover:bg-gray-100 p-2"
            >
              <input
                type="text"
                placeholder="Enter a section name. e.g., Critical Analysis"
                value={field}
                className="text-sm font-bold text-gray-700 w-full"
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputFields(
                    inputFields.map((item, i) =>
                      i === index ? newValue : item
                    )
                  );
                }}
              />
              <button
                className="text-red-500"
                onClick={() => {
                  setInputFields(inputFields.filter((_, i) => i !== index));
                }}
              >
                <TrashIcon className="stroke-2 h-6 w-6 p-1" />
              </button>
            </li>
          ))}
        </ul>
        <button
          className="w-full bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:bg-gray-400 disabled:hover:bg-gray-400"
          disabled={inputFields.some((item) => item === "" || item === null)}
          onClick={() => {
            setInputFields([...inputFields, ""]);
          }}
        >
          <PlusIcon className="stroke-2 h-6 w-6 p-1" />
        </button>
      </div>
    </div>
  );
};
