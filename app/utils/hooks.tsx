import { useMatches } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { Meeting } from "./db";
import type { Insight } from "./supabase";

export const useRouteData = <T,>(routeId: string): T | undefined => {
  const matches = useMatches();
  const data = matches.find((match) => match.id === routeId)?.data;

  return data as T | undefined;
};

export const useRouteParam = <T,>(
  routeId: string,
  paramName: string
): T | undefined => {
  const matches = useMatches();
  const param = matches.find((match) => match.id === routeId)?.params?.[
    paramName
  ];

  return param as T | undefined;
};

function meetingArrayEqual(a1: Meeting[], a2: Meeting[]) {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    if (a1[i].id !== a2[i].id) return false;
    if (a1[i].guildId !== a2[i].guildId) return false;
    if (a1[i].channelName !== a2[i].channelName) return false;
  }
  return true;
}

type MaybeCleanUpFn = void | (() => void);

export const useMeetingArrayEffect = (
  cb: () => MaybeCleanUpFn,
  deps: Meeting[]
) => {
  const ref = useRef<Meeting[]>(deps);

  if (!meetingArrayEqual(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cb, [ref.current]);
};

function insightArrayEqual(
  a1: Insight[],
  a2: Insight[],
  meetingId1: string,
  meetingId2: string,
  insightText1?: string | null | undefined,
  insightText2?: string | null | undefined
) {
  if (meetingId1 !== meetingId2) return false;
  if (insightText1 !== insightText2) return false;
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    if (a1[i].id !== a2[i].id) return false;
  }
  return true;
}
export const useInsightArrayEffect = (
  cb: () => MaybeCleanUpFn,
  deps: [Insight[], string]
) => {
  const ref = useRef<[Insight[], string]>(deps);

  if (!insightArrayEqual(deps[0], ref.current[0], deps[1], ref.current[1])) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cb, [ref.current]);
};
