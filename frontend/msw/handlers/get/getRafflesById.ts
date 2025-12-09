import * as Raffles from "../../../_mocks_/raffles";
import { http, HttpResponse, HttpHandler } from "msw";

export const getRafflesById: HttpHandler = http.get(
  "/api/admin/raffles/:id",
  async ({ params }) => {
    try {
      const data = await Raffles.get(String(params.id));
      return HttpResponse.json(data, { status: 200 });
    } catch {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
  }
);
