import type { FC } from "react";
import { createContext, useState } from "react";
import type { SelectedMeetingContextType } from "~/@types/selectedMeeting";

export const SelectedMeetingContext =
  createContext<SelectedMeetingContextType | null>(null);

interface Props {
  children: React.ReactNode;
}
const SelectedMeetingProvider: FC<Props> = ({ children }) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<
    string | undefined
  >(undefined);
  const [selectedCardId, setSelectedCardId] = useState(0);

  //   const setSelectedMeeting = (meetingId: string | undefined) => {
  //     setSelectedMeetingId(meetingId);
  //   };

  //   const setSelectedCard = (cardId: number) => {
  //     setSelectedCardId(cardId);
  //   };

  return (
    <SelectedMeetingContext.Provider
      value={{
        selectedMeetingId,
        selectedCardId,
        setSelectedMeetingId,
        setSelectedCardId,
      }}
    >
      {children}
    </SelectedMeetingContext.Provider>
  );
};

export default SelectedMeetingProvider;
