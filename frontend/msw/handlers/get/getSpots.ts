import { getDB } from "../../../_mocks_/db";
import { http, HttpResponse, HttpHandler } from "msw";

export const getSpots: HttpHandler = http.get("/api/spots", () => {
  const db = getDB();
  return HttpResponse.json(db.spots, { status: 200 });
});
