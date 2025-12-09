import { http, HttpResponse, type HttpHandler } from "msw";
import * as Auth from "../../../_mocks_/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export const postLogin: HttpHandler = http.post(
  "/api/auth/login",
  async ({ request }) => {
    let body: LoginBody;

    try {
      body = (await request.json()) as LoginBody;
    } catch {
      return HttpResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email, password } = body ?? {};

    if (!email || !password) {
      return HttpResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    try {
      const data = await Auth.login(String(email), String(password));

      const cookieValue = `auth_token=${data.token}; path=/; SameSite=lax`;

      return HttpResponse.json(data, {
        status: 200,
        headers: { "Set-Cookie": cookieValue },
      });
    } catch (e: any) {
      return HttpResponse.json(
        { message: e?.message || "Invalid credentials" },
        { status: 401 }
      );
    }
  }
);
