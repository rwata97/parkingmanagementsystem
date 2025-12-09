import { http, HttpResponse, HttpHandler } from "msw";
import * as Residents from "../../../_mocks_/residents";

export interface HandlerConfig {
  operationName: string;
  handler: HttpHandler;
  mockData?: any;
}

export const getResidents: HttpHandler = http.get(
  "/api/residents",
  async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const data = await Residents.list(q);
    return HttpResponse.json(data, { status: 200 });
  }
);
