import * as Raffles from "../../../_mocks_/raffles";
import { http, HttpResponse } from "msw";
import type { HttpHandler } from "msw";

export const postRegisterForRaffles: HttpHandler = http.post(
  "/api/raffles/register",
  async ({ request }) => {
    const residentId = (await request.json()) as Record<string, string>;

    const data = await Raffles.register({
      residentId: residentId.residentId,
    });
    return HttpResponse.json(data, { status: 200 });
  }
);
