import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useRegisterForRaffle } from "./useRegisterForRaffle";
import { fetchAPI } from "@/lib/fetchAPI";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const apiMock = fetchAPI as unknown as ReturnType<typeof vi.fn>;

function createWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useRegisterForRaffle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls /api/raffles/register with residentId when mutateAsync is called", async () => {
    apiMock.mockResolvedValueOnce({ ok: true });

    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useRegisterForRaffle("resident-123"), {
      wrapper,
    });

    await result.current.mutateAsync();

    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith("/api/raffles/register", {
      method: "POST",
      body: JSON.stringify({ residentId: "resident-123" }),
    });
  });

  it("throws an error if residentId is missing", async () => {
    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useRegisterForRaffle(undefined), {
      wrapper,
    });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Cannot register raffle: missing residentId"
    );

    expect(apiMock).not.toHaveBeenCalled();
  });
});
