import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type Resident = {
  id: string;
  name: string;
  email: string;
  vehicle?: { type?: string; plate?: string };
};

export function useResidents(): UseQueryResult<Resident[], Error> {
  return useQuery<Resident[]>({
    queryKey: ["admin", "residents"],
    queryFn: () => fetchAPI<Resident[]>("/api/residents"),
    staleTime: 60_000,
  });
}
