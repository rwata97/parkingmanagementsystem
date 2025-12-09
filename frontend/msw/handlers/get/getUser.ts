import { http, HttpResponse, HttpHandler } from "msw";
import * as Auth from "../../../_mocks_/auth";

export const getUser: HttpHandler = http.get(
  "/api/auth/me",
  async ({ cookies }) => {
    const token = cookies["auth_token"];
    try {
      const data = await Auth.me(token);
      return HttpResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache no-store must-revalidate proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      });
    } catch (e: any) {
      return HttpResponse.json(
        { message: e?.message || "Unauthorized" },
        { status: 401 }
      );
    }
  }
);
