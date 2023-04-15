import { useMatches } from "@remix-run/react";

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
