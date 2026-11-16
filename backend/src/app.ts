import express, { type RequestHandler } from "express";
import cors from "cors";
import { attachRouting, createConfig, type Routing } from "express-zod-api";
import { createOpenApiDocument } from "./api/openapi.js";
import { createHealthController } from "./controllers/health.controller.js";
import { createHealthService } from "./services/health.service.js";
import type { AppConfig } from "./config.js";
import { normalizeAuthErrors } from "./http/auth-error-normalizer.js";
import { applicationErrorHandler, problemDetailsResultHandler } from "./http/problem-details.js";

export interface CreateAppOptions {
  config: AppConfig;
  checkDatabase: () => Promise<void>;
  authHandler?: RequestHandler;
  additionalRouting?: Routing;
}

export function createApp({ config, checkDatabase, authHandler, additionalRouting = {} }: CreateAppOptions) {
  const app = express();
  const additionalV1 = (additionalRouting.api as Routing | undefined)?.v1 as Routing | undefined;
  const routing: Routing = {
    api: {
      v1: {
        health: createHealthController(createHealthService(checkDatabase)),
        ...(additionalV1 ?? {}),
      },
    },
  };

  app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));

  // Better Auth must receive the untouched request stream before any body parser.
  if (authHandler) {
    app.all("/api/v1/auth", normalizeAuthErrors, authHandler);
    app.all("/api/v1/auth/*splat", normalizeAuthErrors, authHandler);
  }

  app.use(express.json({ limit: "1mb" }));

  const apiConfig = createConfig({
    app,
    cors: false,
    startupLogo: false,
    logger: { level: config.NODE_ENV === "production" ? "warn" : "info" },
    errorHandler: problemDetailsResultHandler,
  });
  const { notFoundHandler } = attachRouting(apiConfig, routing);

  app.get("/api/v1/openapi.json", (_request, response) => {
    response.json(createOpenApiDocument(routing, apiConfig));
  });

  app.use(notFoundHandler);
  app.use(applicationErrorHandler);
  app.use((request, response) => {
    response
      .status(404)
      .type("application/problem+json")
      .json({
        type: "urn:parking-management:problem:http-404",
        title: "Not Found",
        status: 404,
        instance: request.path,
      });
  });

  return app;
}
