export async function generateInsightFromTranscript(
  processedTranscripts,
  key,
  sections
) {
  processedTranscripts
    .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
    .forEach((transcript) => {
      delete transcript.timestamp;
      transcript.username = transcript.username.slice(0, -5);
    });

  try {
    const chunkedTranscripts = [[]];
    let i = 0;
    // 1000 tokens per request

    let currentTokens = 0;
    for (let j = 0; j < processedTranscripts.length; j += 1) {
      if (
        JSON.stringify(processedTranscripts[j]).length / 4 + currentTokens <=
        1000
      ) {
        currentTokens += JSON.stringify(processedTranscripts[j]).length / 4;
        chunkedTranscripts[i].push(processedTranscripts[j]);
      } else {
        i += 1;
        chunkedTranscripts[i] = [];
        currentTokens = 0;
        j -= 1;
      }
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content:
              buildPrompt(sections) + JSON.stringify(chunkedTranscripts[0]),
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    console.log("res", res);
    let json = await res.json();
    console.log("json", json);

    let styledText = json.choices[0].message.content;

    if (chunkedTranscripts.length > 1) {
      for (let i = 1; i < chunkedTranscripts.length; i += 1) {
        console.log("i", i);

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: buildContinueInsightPrompt(
                  styledText,
                  chunkedTranscripts[i]
                ),
              },
            ],
            temperature: 0.1,
            max_tokens: 1000,
          }),
        });
        console.log("res", res);

        const json = await res.json();
        styledText = json.choices[0].message.content;
        console.log("styledText", styledText);
      }
    }
    console.log("styledText", styledText);

    return styledText;
  } catch (err) {
    console.log("error generating insight:", err);
    throw err;
  }
}

const BASE_PROMPT =
  "Given the following transcript, please provide an insight into the meeting. And format your response with proper line-breaks in markdown format. Only have the following headers (do no include parenthesis) in the memo. Use bullet points and the username field provided in json whenever appropriate. Make all headers with ##. DO NOT MAKE UP ANYTHING ELSE \n\n";

const CONTINUE_PROMPT =
  "Given the generated insight and additional transcripts, please modify, refine the content of each section of the generated insight accordingly. You must output the new insight with the same styling and headers. DO NOT MAKE UP ANYTHING ELSE \n\n";

function buildPrompt(sections) {
  let prompt = BASE_PROMPT;
  sections.forEach((section) => {
    prompt += section + "\n\n";
  });
  prompt +=
    "\n\n\n Now here's the transcript in JSON format [{username, timestamp, text}]\n\n";

  return prompt;
}

function buildContinueInsightPrompt(generatedInsight, transcripts) {
  let prompt = CONTINUE_PROMPT;
  prompt += "\n\n\n here's the existing insight\n\n";
  prompt += generatedInsight;
  prompt +=
    "\n\n\n Now here's the transcript in JSON format [{username, timestamp, text}]\n\n";
  prompt += JSON.stringify(transcripts);

  return prompt;
}
