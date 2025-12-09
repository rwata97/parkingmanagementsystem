import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";
import type { Raffle } from "./useRafflesList";

type UseRunRaffleResult = {
  runRaffle: (cycle: string) => void;
  runRaffleAsync: (cycle: string) => Promise<Raffle>;
  isRunning: boolean;
  error: Error | null;
};

export function useRunRaffle(): UseRunRaffleResult {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (cycle: string) =>
      fetchAPI<Raffle>("/api/admin/raffle", {
        method: "POST",
        body: JSON.stringify({ cycle }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "raffles", "list"] });
      qc.invalidateQueries({ queryKey: ["raffles", "current"] });
      qc.invalidateQueries({ queryKey: ["spots", "all"] });
    },
    onError: (error) => {
      console.error(error);
      console.log("error", error);
    },
  });

  return {
    runRaffle: mutation.mutate,
    runRaffleAsync: mutation.mutateAsync,
    isRunning: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
