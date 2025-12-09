import { http, HttpResponse } from "msw";
import * as Auth from "../../../_mocks_/auth";
import type { HttpHandler } from "msw";

export const postRequestResetConfirm: HttpHandler = http.post(
  "/api/auth/password/reset/confirm",
  async ({ request }) => {
    const { token, newPassword } = (await request.json()) as Record<
      string,
      string
    >;
    if (!token || !newPassword) {
      return HttpResponse.json(
        { message: "token and newPassword are required" },
        { status: 400 }
      );
    }
    const data = await Auth.resetPassword(String(token), String(newPassword));
    return HttpResponse.json(data, { status: 200 });
  }
);
