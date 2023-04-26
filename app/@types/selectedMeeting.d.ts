export type SelectedMeetingContextType = {
  selectedMeetingId: string | undefined;
  setSelectedMeetingId: (selectedMeeting: string | undefined) => void;
  selectedCardId: number;
  setSelectedCardId: (selectedCard: number) => void;
};
