import { http, HttpResponse } from "msw";
import * as Auth from "../../../_mocks_/auth";
import type { HttpHandler } from "msw";

export const postResetRequest: HttpHandler = http.post(
  "/api/auth/password/reset/request",
  async ({ request }) => {
    const { email } = (await request.json()) as Record<string, string>;
    const data = await Auth.requestPasswordReset(String(email || ""));
    return HttpResponse.json(data, { status: 200 });
  }
);
