import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useCurrentRaffle, type CurrentRaffle } from "./useCurrentRaffle";
import { fetchAPI } from "@/lib/fetchAPI";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const apiMock = fetchAPI as unknown as ReturnType<typeof vi.fn>;

function wrapperWithClient(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useCurrentRaffle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the current raffle from /api/raffles/current", async () => {
    const mockRaffle: CurrentRaffle = {
      cycle: "2025-Q4",
      regOpen: true,
      regClosesAt: "2025-12-31T23:59:59Z",
      count: 42,
    };

    apiMock.mockResolvedValueOnce(mockRaffle);

    const queryClient = new QueryClient();
    const wrapper = wrapperWithClient(queryClient);

    const { result } = renderHook(() => useCurrentRaffle(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith("/api/raffles/current");

    expect(result.current.data).toEqual(mockRaffle);

    expect(result.current.dataUpdatedAt).not.toBe(0);
  });
});
