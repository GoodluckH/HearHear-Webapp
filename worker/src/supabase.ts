import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yjezghyuqbzwxoovnlwo.supabase.co";

export function createSupabaseClient(key: string) {
  return new MySupabaseClient(supabaseUrl, key);
}

export type Insight = {
  id: string;
  created_at: string;
  displayName: string;
  discriminator: string;
  text: string;
};

export class MySupabaseClient {
  supabase: SupabaseClient<any, "public", any>;

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  public getClient() {
    return this.supabase;
  }

  public async logErrorMessage(message: string, meetingId: string) {
    await this.supabase.from("errors").insert({
      message,
      meeting_id: meetingId,
    });
  }

  //   public async getUserCredits(user: DiscordUser) {
  //     await this.loginUser(user);

  //     const { data, error } = await this.supabase
  //       .from("users")
  //       .select("credits")
  //       .eq("id", user.id);

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     if (data && data.length > 0) {
  //       return data[0].credits;
  //     }

  //     return -1;
  //   }

  //   public async addCredit(
  //     user: DiscordUser,
  //     currentAmount: number,
  //     amount: number
  //   ) {
  //     await this.loginUser(user);

  //     const { error } = await this.supabase
  //       .from("users")
  //       .update({ credits: currentAmount + amount })
  //       .eq("id", user.id);

  //     if (error) {
  //       throw new Error(error.message);
  //     }
  //   }

  public async getTranscript(meetingId: string) {
    const { data, error } = await this.supabase
      .from("transcripts")
      .select("*, meeting_id::text")
      .eq("meeting_id", meetingId);
    if (error) {
      throw new Error(error.message);
    }

    if (data !== null && data.length > 0) {
      // @ts-ignore
      return JSON.parse(data[0].transcript);
    }
    return [];
  }

  public async getInsights(meetingId: string) {
    const { data, error } = await this.supabase
      .from("insights")
      .select("*, user_id::text, meeting_id::text")
      .eq("meeting_id", meetingId);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      const insights: Insight[] = [];
      await Promise.all(
        data.map(async (row) => {
          const user = await this.supabase
            .from("users")
            .select("*")
            // @ts-ignore
            .eq("id", BigInt(row.user_id));

          if (user.error) {
            throw new Error(user.error.message);
          }

          const displayName =
            user.data && user.data.length >= 1 ? user.data[0].display_name : "";
          const discriminator =
            user.data && user.data.length >= 1
              ? user.data[0].discriminator
              : "";

          insights.push({
            // @ts-ignore
            id: row.id,
            // @ts-ignore
            created_at: row.created_at,
            displayName,
            discriminator,
            // @ts-ignore
            text: row.insight_text,
          });
        })
      );
      return insights;
    }

    return [];
  }

  // public async getParticipants(
  //   meeting: Meeting,
  //   S3_BUCKET_REGION: string,
  //   S3_BUCKET_NAME: string
  // ) {
  //   // get the participants from the meetings table
  //   const { data, error } = await this.supabase
  //     .from("meetings")
  //     .select("participants")
  //     .eq("id", meeting.id);

  //   if (error) {
  //     throw new Error(error.message);
  //   }

  //   if (data && data.length > 0) {
  //     return data[0].participants;
  //   } else {
  //     const transcripts = await getTranscripts(
  //       meeting.guildId,
  //       meeting.channelId,
  //       meeting.id,
  //       S3_BUCKET_REGION,
  //       S3_BUCKET_NAME
  //     );

  //     if (transcripts === null || transcripts.length === 0) {
  //       throw new Error("No transcripts found or error fetching transcripts");
  //     }

  //     await this.supabase
  //       .from("meetings")
  //       .update({ participants: meeting.participants })
  //       .eq("id", meeting.id);
  //   }
  // }

  public async updateInsightStatus(
    meetingId: string,
    userId: string,
    insightText: string,
    status: string
  ) {
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

  public async createInsight(
    guildId: string,
    channelId: string,
    meetingId: string,
    userId: string
  ) {
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
      throw new Error((e as PostgrestError).message);
    }
  }

  public async checkIfExists(
    tableName: string,
    columnToCheck: string,
    value: string
  ) {
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

//   public async getGuilds(userId: string) {

//   public async guildExists(guild: BasicGuildInfo) {
//     const { data, error } = await this.supabase
//       .from("guilds")
//       .select("*")
//       .eq("id", guild.id);

//     if (error) {
//       throw new Error(error.message);
//     }
//     if (data && data.length > 0) {
//       await this.supabase.from("guilds").update({ owner: guild.owner });
//       return true;
//     }
//     return false;
//   }
// }

// create insight -> check if there's a meeting -> if not create meeting -> create insight
