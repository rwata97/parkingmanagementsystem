import { http, HttpResponse } from "msw";
import * as Auth from "../../../_mocks_/auth";
import type { HttpHandler } from "msw";

type RegisterBody = {
  name: string;
  email: string;
  password: string;
  vehicle: Record<string, string>;
};

export const postRegister: HttpHandler = http.post(
  "/api/auth/register",
  async ({ request }) => {
    const { name, email, password, vehicle } =
      (await request.json()) as RegisterBody;

    try {
      const data = await Auth.register(
        String(name || ""),
        String(email || ""),
        String(password || ""),
        vehicle || {}
      );
      return HttpResponse.json(data, { status: 201 });
    } catch (e: any) {
      const msg = e?.message || "Registration failed";
      const status = /already in use/i.test(msg) ? 409 : 400;
      return HttpResponse.json({ message: msg }, { status });
    }
  }
);
