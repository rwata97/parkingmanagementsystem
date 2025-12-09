// src/components/auth/AuthProvider.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";

import { AuthProvider, useAuth } from "./AuthProvider";

// --- mocks for useAuthQuery hooks ---
const useCurrentUserMock = vi.fn();
const useLoginMock = vi.fn();
const useRegisterMock = vi.fn();
const useLogoutMock = vi.fn();

vi.mock("@/hooks/useAuthQuery", () => ({
  useCurrentUser: (...args: unknown[]) => useCurrentUserMock(...args),
  useLogin: (...args: unknown[]) => useLoginMock(...args),
  useRegister: (...args: unknown[]) => useRegisterMock(...args),
  useLogout: (...args: unknown[]) => useLogoutMock(...args),
}));

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
}

describe("AuthProvider / useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if useAuth is used outside AuthProvider", () => {
    expect.assertions(1);

    try {
      renderHook(() => useAuth());
    } catch (error) {
      expect((error as Error).message).toBe(
        "useAuth must be used within <AuthProvider>"
      );
    }
  });

  it("should provide user and loading=false when current user is loaded", () => {
    const mockUser = {
      id: "u1",
      name: "Test",
      email: "test@example.com",
      role: "RESIDENT" as const,
    };

    useCurrentUserMock.mockReturnValue({
      data: mockUser,
      isLoading: false,
      refetch: vi.fn(),
    });

    useLoginMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useRegisterMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useLogoutMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("should set loading=true when any auth mutation is pending", () => {
    useCurrentUserMock.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    });

    useLoginMock.mockReturnValue({ isPending: true, mutateAsync: vi.fn() });
    useRegisterMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useLogoutMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it("should login calls loginMutation.mutateAsync and then refetchMe", async () => {
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    const loginMutateAsync = vi.fn().mockResolvedValue({ ok: true });

    useCurrentUserMock.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: refetchMock,
    });

    useLoginMock.mockReturnValue({
      isPending: false,
      mutateAsync: loginMutateAsync,
    });
    useRegisterMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useLogoutMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    const vars = { email: "test@example.com", password: "secret" };

    await act(async () => {
      await result.current.login(vars);
    });

    expect(loginMutateAsync).toHaveBeenCalledTimes(1);
    expect(loginMutateAsync).toHaveBeenCalledWith(vars);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("should register calls registerMutation.mutateAsync and then refetchMe", async () => {
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    const registerMutateAsync = vi.fn().mockResolvedValue({ ok: true });

    useCurrentUserMock.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: refetchMock,
    });

    useLoginMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useRegisterMock.mockReturnValue({
      isPending: false,
      mutateAsync: registerMutateAsync,
    });
    useLogoutMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    const vars = {
      name: "New User",
      email: "new@example.com",
      password: "secret",
      vehicle: { plate: "ABC-123" },
    };

    await act(async () => {
      await result.current.register(vars);
    });

    expect(registerMutateAsync).toHaveBeenCalledTimes(1);
    expect(registerMutateAsync).toHaveBeenCalledWith(vars);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("should logout calls logoutMutation.mutateAsync and then refetchMe", async () => {
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    const logoutMutateAsync = vi.fn().mockResolvedValue({ ok: true });

    useCurrentUserMock.mockReturnValue({
      data: {
        id: "u1",
        name: "Test",
        email: "test@example.com",
        role: "RESIDENT" as const,
      },
      isLoading: false,
      refetch: refetchMock,
    });

    useLoginMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useRegisterMock.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    useLogoutMock.mockReturnValue({
      isPending: false,
      mutateAsync: logoutMutateAsync,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMutateAsync).toHaveBeenCalledTimes(1);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
