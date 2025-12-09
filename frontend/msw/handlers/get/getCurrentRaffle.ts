import { http, HttpHandler, HttpResponse } from "msw";
import * as Raffles from "../../../_mocks_/raffles";

export const getCurrentRaffle: HttpHandler = http.get(
  "/api/raffles/current",
  async () => {
    const data = await Raffles.current();
    return HttpResponse.json(data, { status: 200 });
  }
);
