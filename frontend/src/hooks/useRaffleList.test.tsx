import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useRafflesList, type Raffle } from "./useRafflesList";
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

describe("useRafflesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches raffles list from /api/admin/raffles", async () => {
    const mockRaffles: Raffle[] = [
      {
        id: "r1",
        cycle: "2025-Q3",
        ranAt: "2025-09-30T10:00:00Z",
        winners: [
          { spotId: "A1", residentId: "u1" },
          { spotId: "A2", residentId: "u2" },
        ],
      },
      {
        id: "r2",
        cycle: "2025-Q2",
        ranAt: "2025-06-30T10:00:00Z",
        winners: [{ spotId: "B1", residentId: "u3" }],
      },
    ];

    apiMock.mockResolvedValueOnce(mockRaffles);

    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useRafflesList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(apiMock).toHaveBeenCalledWith("/api/admin/raffles");

    expect(result.current.data).toEqual(mockRaffles);
  });
});
