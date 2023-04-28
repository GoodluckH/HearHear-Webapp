import type { Transcript } from "./db";
import { convertUNIXToString } from "./timestamp";
import { Configuration, OpenAIApi } from "openai";

export async function generateInsightFromTranscript(
  transcripts: Transcript[],
  key: string
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
      prompt: PROMPT + JSON.stringify(processedTranscripts),
      temperature: 0.1,
      max_tokens: 1000,
    });

    // replace all the new lines with <br>
    let styledText = res.data.choices[0].text!.replace(
      "Subject:",
      "<b>Subject:</b>"
    );
    styledText = styledText.replace("Summary:", "<b>Summary:</b>");
    styledText = styledText.replace("Action Items:", "<b>Action Items:</b>");

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

const PROMPT =
  "Given the following transcript, please provide an insight into the meeting. And format your response in a memo format with proper line-breaks in HTML format. Only have the following headers in the memo. DO NOT MAKE UP ANYTHING ELSE \n\n" +
  "Subject: \n\n" +
  "Summary: (feel free to use rich formatting like bullet points)\n\n" +
  "Action Items: (a bullet list for each participant)\n" +
  "\n\n\n Now here's the transcript in JSON format [{username, timestamp, text}]\n\n";
