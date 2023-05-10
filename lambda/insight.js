import { createSupabaseClient } from "./supabase.js";
import { generateInsightFromTranscript } from "./openai.js";

module.exports.generate = async (event) => {
  const data = JSON.parse(event.body);
  const { guildId, channelId, meetingId, sections, userId } = data;
  console.log("data", data);
  try {
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabase = createSupabaseClient(supabaseKey);

    const transcripts = await supabase.getTranscript(meetingId);
    await supabase.createInsight(guildId, channelId, meetingId, userId);

    const insight = await generateInsightFromTranscript(
      transcripts,
      process.env.OPENAI_API_KEY,
      sections
    );

    await supabase.updateInsightStatus(meetingId, userId, insight, "complete");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Insight generated successfully",
      }),
    };
  } catch (e) {
    console.log("error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error generating insights",
          error: e,
        },
        null,
        2
      ),
    };
  }
};
