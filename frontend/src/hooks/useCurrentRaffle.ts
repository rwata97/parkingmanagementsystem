import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type CurrentRaffle = {
  cycle: string;
  regOpen: boolean;
  regClosesAt: string | null;
  count: number;
};

export function useCurrentRaffle(): UseQueryResult<CurrentRaffle, Error> {
  return useQuery<CurrentRaffle>({
    queryKey: ["raffles", "current"],
    queryFn: () => fetchAPI<CurrentRaffle>("/api/raffles/current"),
    staleTime: 60_000,
  });
}
