import { http, HttpHandler, HttpResponse } from "msw";
import * as Raffles from "../../../_mocks_/raffles";

function getUserIdFromRequest(
  request: Request,

  cookies: Record<string, string>
): string | null {
  let token: string | null = null;

  token = cookies["auth_token"] ?? null;

  if (!token) return null;

  try {
    const [uid] = atob(token).split(":");

    return uid || null;
  } catch {
    return null;
  }
}

export const getResidentRaffleHistory: HttpHandler = http.get(
  "/api/resident/raffle-history",

  async ({ request, cookies }) => {
    const userId = getUserIdFromRequest(request, cookies);

    if (!userId) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const rows = await Raffles.historyByResident(userId);

      return HttpResponse.json(rows, { status: 200 });
    } catch (e: any) {
      return HttpResponse.json(
        { message: e?.message || "Failed to load history" },

        { status: 500 }
      );
    }
  }
);
