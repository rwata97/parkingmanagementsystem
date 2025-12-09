import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  type User,
} from "./useAuthQuery";

import { fetchAPI } from "@/lib/fetchAPI";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const apiMock = fetchAPI as unknown as ReturnType<typeof vi.fn>;

// Helper to wrap hooks with a QueryClientProvider
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useAuthQuery hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCurrentUser", () => {
    it("fetches the current user from /api/auth/me", async () => {
      const mockUser: User = {
        id: "u1",
        name: "Alice",
        email: "alice@example.com",
        role: "RESIDENT",
      };

      apiMock.mockResolvedValueOnce(mockUser);

      const queryClient = new QueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/api/auth/me");

      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe("useLogin", () => {
    it("calls /api/auth/login with JSON body and invalidates auth/me on success", async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        token: "fake-token",
        role: "ADMIN" as const,
        userId: "u1",
        name: "Admin User",
      };

      apiMock.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useLogin(), { wrapper });

      const vars = {
        email: "admin@example.com",
        password: "password123",
        vehicle: { plate: "ABC123" },
      };

      const data = await result.current.mutateAsync(vars);

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(vars),
      });

      expect(data).toEqual(mockResponse);

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["auth", "me"],
      });
    });
  });

  describe("useRegister", () => {
    it("calls /api/auth/register with JSON body and invalidates auth/me on success", async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const wrapper = createWrapper(queryClient);

      const mockResponse = {
        token: "reg-token",
        role: "RESIDENT" as const,
        userId: "u2",
        name: "Bob Resident",
      };

      apiMock.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRegister(), { wrapper });

      const vars = {
        name: "Bob Resident",
        email: "bob@example.com",
        password: "supersecret",
        vehicle: { plate: "XYZ999" },
      };

      const data = await result.current.mutateAsync(vars);

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(vars),
      });

      expect(data).toEqual(mockResponse);

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["auth", "me"],
      });
    });
  });

  describe("useLogout", () => {
    it("calls /api/auth/logout and removes auth queries on success", async () => {
      const queryClient = new QueryClient();
      const removeSpy = vi.spyOn(queryClient, "removeQueries");

      const wrapper = createWrapper(queryClient);

      apiMock.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLogout(), { wrapper });

      await result.current.mutateAsync();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });

      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ["auth"],
      });
    });
  });
});
