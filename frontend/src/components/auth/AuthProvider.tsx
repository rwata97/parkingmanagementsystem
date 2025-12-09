import { createContext, useCallback, useContext } from "react";
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  User,
} from "@/hooks/useAuthQuery";

type RegisterVars = {
  name: string;
  email: string;
  password: string;
  vehicle?: Record<string, string>;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (vars: { email: string; password: string }) => Promise<any>;
  register: (vars: RegisterVars) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This runs on mount and after any invalidation, so on refresh it will
  // call /api/auth/me using the cookie and hydrate `user` if logged in.
  const {
    data: me,
    isLoading: loadingMe,
    refetch: refetchMe,
  } = useCurrentUser();

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = useCallback(
    async (vars: { email: string; password: string }) => {
      const res = await loginMutation.mutateAsync(vars);
      // ensure we have the freshest user in context
      await refetchMe();
      return res;
    },
    [loginMutation, refetchMe]
  );

  const register = useCallback(
    async (vars: {
      name: string;
      email: string;
      password: string;
      vehicle?: Record<string, string>;
    }) => {
      const res = await registerMutation.mutateAsync(vars);
      await refetchMe();
      return res;
    },
    [registerMutation, refetchMe]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await refetchMe(); // after logout /me should 401 → user becomes null
  }, [logoutMutation, refetchMe]);

  const value: AuthContextValue = {
    user: me ?? null,
    loading:
      loadingMe ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
