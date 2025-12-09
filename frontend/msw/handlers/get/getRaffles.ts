import { http, HttpResponse, HttpHandler } from "msw";
import * as Raffles from "../../../_mocks_/raffles";

export const getRaffles: HttpHandler = http.get(
  "/api/admin/raffles",
  async ({ request }) => {
    const data = await Raffles.list();
    return HttpResponse.json(data, { status: 200 });
  }
);
