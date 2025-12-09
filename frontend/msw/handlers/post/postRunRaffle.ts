import * as Raffles from "../../../_mocks_/raffles";
import { http, HttpResponse } from "msw";
import type { HttpHandler } from "msw";

export const postRunRaffle: HttpHandler = http.post(
  "/api/admin/raffle",
  async ({ request }) => {
    const { cycle } = (await request.json()) as Record<string, string>;
    if (!cycle)
      return HttpResponse.json({ message: "Missing cycle" }, { status: 400 });
    const data = Raffles.run(String(cycle));
    return HttpResponse.json(data, { status: 200 });
  }
);
