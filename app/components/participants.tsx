import { useEffect, useState } from "react";
import type { Meeting } from "~/utils/db";

type ParticipantsProp = {
  meeting: Meeting | undefined;
};

export const Participants: React.FC<ParticipantsProp> = ({ meeting }) => {
  const [partcipants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!meeting) return;

    const fetchParticipants = async () => {
      setLoading(true);
      var data = new FormData();
      data.append("requestType", JSON.stringify("getParticipantsForMeeting"));
      data.append("guildId", JSON.stringify(meeting.guildId));
      data.append("channelId", JSON.stringify(meeting.channelId));
      data.append("meetingId", JSON.stringify(meeting.id));

      await fetch(`/api`, {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setParticipants(data);
          setLoading(false);
        })
        .catch((e) => {
          console.log(e.message);
          setLoading(false);
        });
    };

    fetchParticipants();
  }, [meeting!.id]);
  return (
    <>
      <h1 className="text-xl font-bold">Participants</h1>
      <ul className="list-disc ml-5">
        {meeting === undefined ? (
          <li>Failed to load meeting details.</li>
        ) : (
          <>
            {loading ? (
              <li>Loading...</li>
            ) : (
              <>
                {partcipants.map((participant, id) => (
                  <li key={id}>{participant.slice(0, -5)}</li>
                ))}
              </>
            )}
          </>
        )}
      </ul>
    </>
  );
};
