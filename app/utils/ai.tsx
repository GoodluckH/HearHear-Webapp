import type { Transcript } from "./db";
import { convertUNIXToString } from "./timestamp";
import { Configuration, OpenAIApi } from "openai";

export async function generateInsightFromTranscript(
  transcripts: Transcript[],
  key: string,
  sections: string[]
) {
  const configuration = new Configuration({
    apiKey: key,
  });
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const processedTranscripts = processTranscripts(transcripts);
  processedTranscripts
    .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
    .forEach((transcript) => {
      transcript.timestamp = convertUNIXToString(transcript.timestamp);
      transcript.username = transcript.username.split("_")[0];
    });

  try {
    const res = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: buildPrompt(sections) + JSON.stringify(processedTranscripts),
      temperature: 0.1,
      max_tokens: 1000,
    });

    // replace all <h1 id='S&B*'>
    const searchRegExp = new RegExp("<h1 id='S&B*'>", "g");
    const replaceWith = "<h1 className='font-bold text-xl'>";
    let styledText = res.data.choices[0].text!.replace(
      searchRegExp,
      replaceWith
    );

    return styledText;
  } catch (err) {
    throw err;
  }
}

// export function getParticipants(transcripts: Transcript[]) {
//   return new Set(
//     transcripts.map((transcript) =>
//       transcript.filename.split("-")[1].split(".")[0].slice(0, -4)
//     )
//   );
// }

function processTranscripts(transcripts: Transcript[]) {
  return transcripts.map((transcript) => ({
    username: transcript.filename.split("-")[1].split(".")[0],
    timestamp: transcript.filename.split("-")[0],
    text: transcript.text,
  }));
}

const BASE_PROMPT =
  "Given the following transcript, please provide an insight into the meeting. And format your response with proper line-breaks in markdown format. Only have the following headers (do no include parenthesis) in the memo. Use bullet points and the username field provided in json whenever appropriate. Make all headers with ##. DO NOT MAKE UP ANYTHING ELSE \n\n";

function buildPrompt(sections: string[]) {
  let prompt = BASE_PROMPT;
  sections.forEach((section) => {
    prompt += section + "\n\n";
  });
  prompt +=
    "\n\n\n Now here's the transcript in JSON format [{username, timestamp, text}]\n\n";

  return prompt;
}
