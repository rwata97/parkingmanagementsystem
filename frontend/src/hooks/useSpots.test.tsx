import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useSpots, type Spot } from "./useSpots";
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

describe("useSpots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches spots from /api/spots", async () => {
    const mockSpots: Spot[] = [
      { id: "A1", status: "assigned", residentId: "u1" },
      { id: "A2", status: "available" },
    ];

    apiMock.mockResolvedValueOnce(mockSpots);

    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useSpots(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith("/api/spots");
    expect(result.current.data).toEqual(mockSpots);
  });
});
