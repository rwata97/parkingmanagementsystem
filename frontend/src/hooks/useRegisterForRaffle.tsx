import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

type RegisterPayload = {
  residentId?: string;
};

export function useRegisterForRaffle(
  residentId?: string
): UseMutationResult<unknown, Error, void> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!residentId) {
        throw new Error("Cannot register raffle: missing residentId");
      }

      return fetchAPI("/api/raffles/register", {
        method: "POST",
        body: JSON.stringify({ residentId }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["raffles", "current"] });
      qc.invalidateQueries({ queryKey: ["spots", "all"] });
      qc.invalidateQueries({ queryKey: ["resident", "raffleHistory"] });
    },
    onError: (error) => {
      // centralised error handling
      console.error(error);
    },
  });
}
