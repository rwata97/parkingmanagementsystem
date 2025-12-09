import { http, HttpResponse } from "msw";
import * as Auth from "../../../_mocks_/auth";
import type { HttpHandler } from "msw";

export const postLogout: HttpHandler = http.post(
  "/api/auth/logout",
  async ({ cookies }) => {
    const token = cookies["auth_token"];

    await Auth.logout(token);

    return HttpResponse.json(
      { ok: true },
      {
        status: 200,
        headers: { "Set-Cookie": "auth_token=; path=/; SameSite=lax" },
      }
    );
  }
);
