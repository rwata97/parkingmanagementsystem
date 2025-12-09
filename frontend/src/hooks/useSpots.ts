import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type Spot = {
  id: string;
  status: "available" | "assigned" | "reserved" | "maintenance";
  residentId?: string;
};

export function useSpots(): UseQueryResult<Spot[], Error> {
  return useQuery<Spot[]>({
    queryKey: ["spots", "all"],
    queryFn: () => fetchAPI<Spot[]>("/api/spots"),
    staleTime: 30_000,
  });
}
