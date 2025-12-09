import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type ResidentHistoryRow = {
  cycle: string;
  result: "Selected" | "Not selected";
  spot: string | null;
};

type UseResidentRaffleHistoryResult = {
  history: ResidentHistoryRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useResidentRaffleHistory(
  enabled: boolean = true
): UseResidentRaffleHistoryResult {
  const q = useQuery<ResidentHistoryRow[]>({
    queryKey: ["resident", "raffleHistory"],
    queryFn: () =>
      fetchAPI<ResidentHistoryRow[]>("/api/resident/raffle-history"),
    enabled, // don't run until user is known
    staleTime: 60_000,
  });

  return {
    history: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error as Error | null,
    refetch: q.refetch,
  };
}
