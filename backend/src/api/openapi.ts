import { Documentation } from "express-zod-api/documentation";
import type { Routing } from "express-zod-api";

export function createOpenApiDocument(
  routing: Routing,
  config: ConstructorParameters<typeof Documentation>[0]["config"],
) {
  return new Documentation({
    routing,
    config,
    info: {
      title: "Community Parking Management API",
      version: "1.0.0",
      description: "Versioned API for the Community Parking Management System.",
    },
  }).getSpec();
}
