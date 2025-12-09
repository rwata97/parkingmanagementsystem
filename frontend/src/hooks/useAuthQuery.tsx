import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { fetchAPI } from "@/lib/fetchAPI";

export type Role = "ADMIN" | "RESIDENT";
export type User = { id: string; name: string; email: string; role: Role };

type AuthResponse = {
  token: string;
  role: Role;
  userId: string;
  name: string;
  vehicle?: Record<string, string>;
};

export function useCurrentUser(): UseQueryResult<User, Error> {
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: () => fetchAPI<User>("/api/auth/me"),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false, // no retry on 401
  });
}

export function useLogin(): UseMutationResult<
  AuthResponse,
  Error,
  {
    email: string;
    password: string;
    vehicle?: Record<string, string>;
  }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars) => {
      const data = await fetchAPI<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(vars),
      });

      return data;
    },
    onSuccess: () => {
      // refetch /api/auth/me so the UI gets the logged-in user
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useRegister(): UseMutationResult<
  AuthResponse,
  Error,
  {
    name: string;
    email: string;
    password: string;
    vehicle?: Record<string, string>;
  }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars) => {
      const data = await fetchAPI<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(vars),
      });

      // Cookie with token is set by backend

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetchAPI("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["auth"] });
    },
  });
}
