import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { DiscordUser } from "~/auth.server";
import type { BasicGuildInfo } from "~/routes/dashboard";
import { getProcessedTranscripts, type Meeting } from "./db";

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

  /**
   * Add a user to supabase. If the user does not exist in the database,
   * create a new user with 10 credits. Otherwise, do nothing.
   *
   * @param user the user to login. Retrieved from the Discord auth
   * strategy
   */
  public async loginUser(user: DiscordUser) {
    try {
      const userExist = await this.checkIfExists("users", "id", user.id);
      if (!userExist) {
        await this.supabase.from("users").insert({
          id: user.id,
          display_name: user.displayName,
          discriminator: user.discriminator,
          credits: 500,
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async logErrorMessage(message: string, meetingId: string) {
    await this.supabase.from("errors").insert({
      message,
      meeting_id: meetingId,
    });
  }

  /**
   * Batch create guilds on supabase if they do not exist.
   *
   * @param userId the user id associated with the guilds
   * @param guilds the guilds to add to the database
   */
  public async batchCreateGuilds(userId: string, guilds: BasicGuildInfo[]) {
    console.log("inserting guilds");
    const guildsError = (
      await this.supabase.from("guilds").upsert(
        guilds.map((guild) => ({
          id: guild.id,
          owner: guild.owner,
        })),
        { onConflict: "id", ignoreDuplicates: true }
      )
    ).error;

    console.log(guildsError);

    if (guildsError) {
      throw new Error(guildsError.message);
    }

    console.log("inserting user-guild pairs");
    const { error } = await this.supabase.from("user_guild").upsert(
      guilds.map(
        (guild) => ({
          guild_id: guild.id,
          user_id: userId,
          hash: guild.id.concat(userId),
        }),
        { onConflict: "hash", ignoreDuplicates: true }
      )
    );
    console.log(error);

    if (error) {
      throw new Error(error.message);
    }

    console.log("done");
  }

  public async getUserCredits(user: DiscordUser) {
    await this.loginUser(user);

    const { data, error } = await this.supabase
      .from("users")
      .select("credits")
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0].credits;
    }

    return -1;
  }

  public async addCredit(
    user: DiscordUser,
    currentAmount: number,
    amount: number
  ) {
    await this.loginUser(user);

    const { error } = await this.supabase
      .from("users")
      .update({ credits: currentAmount + amount })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  public async saveProcessedTranscripts(
    guildId: string,
    channelId: string,
    meetingId: string,
    S3_BUCKET_REGION: string,
    S3_BUCKET_NAME: string
  ) {
    const guildExist = await this.checkIfExists("guilds", "id", guildId);

    if (!guildExist) {
      try {
        await this.supabase.from("guilds").insert({ id: guildId });
      } catch (e) {
        console.log("guild insert error:", e);
      }
    }

    const channelExist = await this.checkIfExists("channels", "id", channelId);

    if (!channelExist) {
      try {
        await this.supabase
          .from("channels")
          .insert({ id: channelId, guild_id: guildId });
      } catch (e) {
        console.log("channel insert error:", e);
      }
    }

    const meetingExist = await this.checkIfExists("meetings", "id", meetingId);
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

    const exist = await this.checkIfExists(
      "transcripts",
      "meeting_id",
      meetingId
    );

    if (!exist) {
      const processedTranscripts = await getProcessedTranscripts(
        guildId,
        channelId,
        meetingId,
        S3_BUCKET_REGION,
        S3_BUCKET_NAME
      );
      const { error } = await this.supabase.from("transcripts").insert({
        meeting_id: meetingId,
        transcript: processedTranscripts,
      });
      if (error) {
        throw new Error(error.message);
      }
    }
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

  public async uploadInsight(
    meeting: Meeting,
    userId: string,
    insghtText: string
  ) {
    try {
      const guildExist = await this.checkIfExists(
        "guilds",
        "id",
        meeting.guildId
      );

      if (!guildExist) {
        try {
          await this.supabase.from("guilds").insert({ id: meeting.guildId });
        } catch (e) {
          console.log("guild insert error:", e);
        }
      }

      const channelExist = await this.checkIfExists(
        "channels",
        "id",
        meeting.channelId
      );

      if (!channelExist) {
        try {
          await this.supabase
            .from("channels")
            .insert({ id: meeting.channelId, guild_id: meeting.guildId });
        } catch (e) {
          console.log("channel insert error:", e);
        }
      }

      const meetingExist = await this.checkIfExists(
        "meetings",
        "id",
        meeting.id
      );
      if (!meetingExist) {
        try {
          await this.supabase.from("meetings").insert({
            id: meeting.id,
            channel_id: meeting.channelId,
            guild_id: meeting.guildId,
          });
        } catch (e) {
          console.log("meeting insert error:", e);
        }
      }

      const { error } = await this.supabase.from("insights").insert({
        meeting_id: meeting.id,
        user_id: userId,
        insight_text: insghtText,
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
