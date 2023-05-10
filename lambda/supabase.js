import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yjezghyuqbzwxoovnlwo.supabase.co";

export function createSupabaseClient(key) {
  return new MySupabaseClient(supabaseUrl, key);
}

export class MySupabaseClient {
  supabase;

  constructor(url, key) {
    this.supabase = createClient(url, key);
  }

  getClient() {
    return this.supabase;
  }

  async logErrorMessage(message, meetingId) {
    await this.supabase.from("errors").insert({
      message,
      meeting_id: meetingId,
    });
  }

  async getTranscript(meetingId) {
    const { data, error } = await this.supabase
      .from("transcripts")
      .select("*, meeting_id::text")
      .eq("meeting_id", meetingId);
    if (error) {
      console.log("error getting transcript:", error);
      throw new Error(error.message);
    }

    if (data !== null && data.length > 0) {
      // @ts-ignore
      return JSON.parse(data[0].transcript);
    }
    return [];
  }

  async updateInsightStatus(meetingId, userId, insightText, status) {
    const { error } = await this.supabase
      .from("insights")
      .update({ status, insight_text: insightText })
      .eq("meeting_id", meetingId)
      .eq("user_id", userId);

    if (error) {
      console.log("error updating insight status:", error);
      await this.logErrorMessage(
        "error updating insight status: " + error,
        meetingId
      );
      throw new Error(error.message);
    }
  }

  async createInsight(guildId, channelId, meetingId, userId) {
    try {
      const guildExist = await this.checkIfExists("guilds", "id", guildId);

      if (!guildExist) {
        try {
          await this.supabase.from("guilds").insert({ id: guildId });
        } catch (e) {
          console.log("guild insert error:", e);
        }
      }

      const channelExist = await this.checkIfExists(
        "channels",
        "id",
        channelId
      );

      if (!channelExist) {
        try {
          await this.supabase
            .from("channels")
            .insert({ id: channelId, guild_id: guildId });
        } catch (e) {
          console.log("channel insert error:", e);
        }
      }

      const meetingExist = await this.checkIfExists(
        "meetings",
        "id",
        meetingId
      );
      if (!meetingExist) {
        try {
          await this.supabase.from("meetings").insert({
            id: meetingId,
            channel_id: channelId,
            guild_id: guildId,
          });
        } catch (e) {
          console.log("meeting insert error:", e);
        }
      }

      const { error } = await this.supabase.from("insights").insert({
        meeting_id: meetingId,
        user_id: userId,
        status: "pending",
      });
      console.log(error);

      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkIfExists(tableName, columnToCheck, value) {
    const { data, error } = await this.supabase
      .from(tableName)
      .select("*")
      .eq(columnToCheck, value);

    if (error) {
      console.log("error:", error);
      throw error;
    }

    if ((data !== null || data !== undefined) && data.length > 0) {
      return true;
    }

    return false;
  }
}
