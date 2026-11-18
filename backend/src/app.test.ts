import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { test } from "node:test";
import { EndpointsFactory } from "express-zod-api";
import { z } from "zod";
import { createApp } from "./app.js";
import type { AppConfig } from "./config.js";
import { createProblemDetails, problemDetailsResultHandler } from "./http/problem-details.js";

const testConfig: AppConfig = {
  NODE_ENV: "test",
  PORT: 0,
  DATABASE_URL: "postgresql://parking:parking@localhost:5432/parking_management",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
  BETTER_AUTH_URL: "http://localhost:4000",
  FRONTEND_ORIGIN: "http://localhost:5173",
};

async function withServer(app: ReturnType<typeof createApp>, run: (baseUrl: string) => Promise<void>) {
  const server: Server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address === "object");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

function createValidationEndpoint() {
  return new EndpointsFactory(problemDetailsResultHandler).build({
    method: "post",
    input: z.object({ name: z.string().min(2) }),
    output: z.object({ accepted: z.boolean() }),
    handler: async () => ({ accepted: true }),
  });
}

function createFailureEndpoint() {
  return new EndpointsFactory(problemDetailsResultHandler).build({
    method: "get",
    input: z.object({}),
    output: z.object({ ok: z.boolean() }),
    handler: async () => {
      throw new Error("sensitive implementation detail");
    },
  });
}

test("health reports database availability and generated OpenAPI includes the endpoint", async () => {
  let databaseAvailable = true;
  const app = createApp({
    config: testConfig,
    checkDatabase: async () => {
      if (!databaseAvailable) throw new Error("database unavailable");
    },
  });

  await withServer(app, async (baseUrl) => {
    const healthy = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(healthy.status, 200);
    assert.deepEqual(await healthy.json().then((body: { status: string; database: string }) => ({
      status: body.status,
      database: body.database,
    })), { status: "ok", database: "ok" });

    databaseAvailable = false;
    const unhealthy = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(unhealthy.status, 503);
    assert.deepEqual(await unhealthy.json().then((body: { status: string; database: string }) => ({
      status: body.status,
      database: body.database,
    })), { status: "degraded", database: "unavailable" });

    const openapi = await fetch(`${baseUrl}/api/v1/openapi.json`);
    assert.equal(openapi.status, 200);
    const spec = await openapi.json() as { paths?: Record<string, unknown> };
    assert.ok(spec.paths?.["/api/v1/health"]);
    const healthPath = spec.paths?.["/api/v1/health"] as {
      get?: { responses?: Record<string, unknown> };
    } | undefined;
    assert.ok(healthPath?.get?.responses?.["503"]);
  });
});

test("application validation errors use safe structured Problem Details", async () => {
  const app = createApp({
    config: testConfig,
    checkDatabase: async () => undefined,
    additionalRouting: {
      api: { v1: { test: { validation: createValidationEndpoint() } } },
    },
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/test/validation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    assert.equal(response.status, 400);
    assert.match(response.headers.get("content-type") ?? "", /application\/problem\+json/);
    const problem = await response.json() as {
      status: number;
      errors?: Array<{ path: string; code: string; message: string }>;
    };
    assert.equal(problem.status, 400);
    assert.equal(problem.errors?.[0]?.path, "name");
    assert.equal(problem.errors?.[0]?.code, "validation_failed");
  });
});

test("unhandled endpoint errors return a generic Problem Details response", async () => {
  const app = createApp({
    config: testConfig,
    checkDatabase: async () => undefined,
    additionalRouting: {
      api: { v1: { test: { failure: createFailureEndpoint() } } },
    },
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/test/failure`);
    assert.equal(response.status, 500);
    assert.match(response.headers.get("content-type") ?? "", /application\/problem\+json/);
    const problem = await response.json() as { status: number; detail?: string };
    assert.equal(problem.status, 500);
    assert.equal(problem.detail, undefined);
  });
});

test("Better Auth is mounted before JSON parsing and its error is normalized", async () => {
  let bodyWasAlreadyParsed = false;
  const app = createApp({
    config: testConfig,
    checkDatabase: async () => undefined,
    authHandler: (request, response) => {
      bodyWasAlreadyParsed = request.body !== undefined;
      response.status(401).json({ message: "Invalid credentials", code: "INVALID_EMAIL_OR_PASSWORD" });
    },
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:5173",
      },
      body: JSON.stringify({ email: "resident@example.test", password: "secret" }),
    });
    assert.equal(bodyWasAlreadyParsed, false);
    assert.equal(response.status, 401);
    assert.match(response.headers.get("content-type") ?? "", /application\/problem\+json/);
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    const problem = await response.json() as { status: number; detail?: string };
    assert.equal(problem.status, 401);
    assert.equal(problem.detail, "Invalid credentials");
  });
});

test("server errors omit implementation details", () => {
  const problem = createProblemDetails(500, "database password leaked");
  assert.equal(problem.status, 500);
  assert.equal(problem.detail, undefined);
});

test("malformed JSON receives a Problem Details response without echoing parser internals", async () => {
  const app = createApp({ config: testConfig, checkDatabase: async () => undefined });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/test/body`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{broken",
    });
    assert.equal(response.status, 400);
    assert.match(response.headers.get("content-type") ?? "", /application\/problem\+json/);
    const problem = await response.json() as { detail?: string };
    assert.equal(problem.detail, "The request body could not be parsed.");
    assert.ok(!problem.detail?.includes("broken"));
  });
});
