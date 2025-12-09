import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type Raffle = {
  id: string;
  cycle: string;
  ranAt: string;
  winners: Array<{ spotId: string; residentId: string }>;
};

export function useRafflesList(): UseQueryResult<Raffle[], Error> {
  return useQuery<Raffle[]>({
    queryKey: ["admin", "raffles", "list"],
    queryFn: () => fetchAPI<Raffle[]>("/api/admin/raffles"),
    staleTime: 60_000,
  });
}
